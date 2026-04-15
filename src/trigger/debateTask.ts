import { task, logger } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/crypto'
import { callSide } from '@/lib/ai'
import type { SideConfig, ConclusionCard, Provider } from '@/lib/ai/types'

export interface DebateTaskPayload {
  runId: string
  roomId: string
  userId: string
  userMessage: string
  settings: {
    side_a_provider: Provider
    side_a_model: string
    side_b_provider: Provider
    side_b_model: string
    side_c_provider: Provider
    side_c_model: string
  }
}

// Service role client bypasses RLS - intentional for background worker
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getDecryptedKey(
  db: ReturnType<typeof getDb>,
  userId: string,
  provider: Provider
): Promise<string> {
  const { data, error } = await db
    .from('encrypted_api_keys')
    .select('encrypted_key')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (error || !data) {
    throw new Error(`No API key found for provider: ${provider}. Please add it in Settings.`)
  }
  return decrypt(data.encrypted_key)
}

async function saveStep(
  db: ReturnType<typeof getDb>,
  runId: string,
  stepType: string,
  side: string | null,
  content: string
) {
  await db.from('run_steps').insert({ run_id: runId, step_type: stepType, side, content })
}

async function saveMessage(
  db: ReturnType<typeof getDb>,
  roomId: string,
  userId: string,
  runId: string,
  side: string,
  content: string
) {
  await db.from('messages').insert({
    room_id: roomId,
    user_id: userId,
    role: 'ai',
    side,
    content,
    run_id: runId,
  })
}

function extractJson(raw: string): string {
  // 1. Strip markdown code fences
  let s = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  // 2. If it already starts with { it's likely clean JSON
  if (s.startsWith('{')) return s
  // 3. Try to extract the first {...} block (handles leading/trailing prose)
  const match = s.match(/\{[\s\S]*\}/)
  if (match) return match[0]
  return s
}

const JUDGE_SCHEMA = `{
  "conclusion": "string - the integrated conclusion",
  "rationale": "string - reasoning behind the conclusion",
  "risks": ["string - risk 1", "string - risk 2"],
  "disagreements": ["string - remaining point of contention"],
  "unknowns": ["string - open question"],
  "next_actions": ["string - recommended action"]
}`

export const structuredDebateTask = task({
  id: 'structured-debate',
  maxDuration: 300,
  run: async (payload: DebateTaskPayload) => {
    const { runId, roomId, userId, userMessage, settings } = payload
    const db = getDb()

    logger.log('Starting structured debate', { runId, roomId })

    // Mark run as running
    await db.from('runs').update({ status: 'running' }).eq('id', runId)

    // ── Decrypt API keys inside the task (never in payload) ─────────────────
    let sideConfigs: SideConfig[]
    try {
      sideConfigs = await Promise.all([
        {
          side: 'a' as const,
          provider: settings.side_a_provider,
          model: settings.side_a_model,
          apiKey: await getDecryptedKey(db, userId, settings.side_a_provider),
        },
        {
          side: 'b' as const,
          provider: settings.side_b_provider,
          model: settings.side_b_model,
          apiKey: await getDecryptedKey(db, userId, settings.side_b_provider),
        },
        {
          side: 'c' as const,
          provider: settings.side_c_provider,
          model: settings.side_c_model,
          apiKey: await getDecryptedKey(db, userId, settings.side_c_provider),
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.from('runs').update({ status: 'failed', error_message: msg }).eq('id', runId)
      throw err
    }

    try {
      // ── STEP 1: Initial opinions (parallel) ───────────────────────────────
      logger.log('Step 1: Initial opinions')
      const initialOpinions = await Promise.all(
        sideConfigs.map(async (cfg) => {
          const content = await callSide(cfg, [
            {
              role: 'system',
              content: `You are AI Side ${cfg.side.toUpperCase()} in a structured debate. Give a clear, well-reasoned initial position on the user's question. Be direct and concise (150-200 words).`,
            },
            { role: 'user', content: userMessage },
          ])
          await saveStep(db, runId, 'initial_opinion', cfg.side, content)
          await saveMessage(db, roomId, userId, runId, cfg.side, content)
          logger.log(`Side ${cfg.side} initial opinion saved`)
          return { side: cfg.side, content }
        })
      )

      // ── STEP 2: Critiques (parallel, each reads the others) ───────────────
      logger.log('Step 2: Critiques')
      const critiques = await Promise.all(
        sideConfigs.map(async (cfg) => {
          const others = initialOpinions
            .filter((o) => o.side !== cfg.side)
            .map((o) => `Side ${o.side.toUpperCase()}: ${o.content}`)
            .join('\n\n')

          const content = await callSide(cfg, [
            {
              role: 'system',
              content: `You are AI Side ${cfg.side.toUpperCase()}. Critically evaluate the other sides' positions. Identify weaknesses, assumptions, or gaps. Be specific and concise (100-150 words).`,
            },
            {
              role: 'user',
              content: `Original question: ${userMessage}\n\nOther positions:\n${others}`,
            },
          ])
          await saveStep(db, runId, 'critique', cfg.side, content)
          logger.log(`Side ${cfg.side} critique saved`)
          return { side: cfg.side, content }
        })
      )

      // ── STEP 3: Revisions (parallel) ──────────────────────────────────────
      logger.log('Step 3: Revisions')
      const revisions = await Promise.all(
        sideConfigs.map(async (cfg) => {
          const myInitial = initialOpinions.find((o) => o.side === cfg.side)!.content
          const receivedCritiques = critiques
            .filter((c) => c.side !== cfg.side)
            .map((c) => `From Side ${c.side.toUpperCase()}: ${c.content}`)
            .join('\n\n')

          const content = await callSide(cfg, [
            {
              role: 'system',
              content: `You are AI Side ${cfg.side.toUpperCase()}. Revise your initial position considering the critiques from other sides. You may maintain, adjust, or significantly change your view. Explain your reasoning (150-200 words).`,
            },
            {
              role: 'user',
              content: `Original question: ${userMessage}\n\nYour initial position:\n${myInitial}\n\nCritiques received:\n${receivedCritiques}`,
            },
          ])
          await saveStep(db, runId, 'revision', cfg.side, content)
          await saveMessage(db, roomId, userId, runId, cfg.side, `[Revised] ${content}`)
          logger.log(`Side ${cfg.side} revision saved`)
          return { side: cfg.side, content }
        })
      )

      // ── STEP 4: Judge synthesis ───────────────────────────────────────────
      logger.log('Step 4: Judge synthesis')
      const judgeConfig = sideConfigs[0] // Use Side A's provider as judge
      const allRevisions = revisions
        .map((r) => `Side ${r.side.toUpperCase()}: ${r.content}`)
        .join('\n\n')

      const judgePrompt = `You are a neutral Judge. Synthesize the following AI positions into a conclusion.

Original question: ${userMessage}

Final positions after debate:
${allRevisions}

Respond with ONLY valid JSON matching this exact schema (no markdown, no explanation outside JSON):
${JUDGE_SCHEMA}`

      const judgeRaw = await callSide(judgeConfig, [
        {
          role: 'system',
          content: 'You are a neutral judge synthesizing a debate. Respond only with valid JSON.',
        },
        { role: 'user', content: judgePrompt },
      ])

      const judgeJson = extractJson(judgeRaw)
      let conclusion: ConclusionCard
      try {
        conclusion = JSON.parse(judgeJson)
      } catch {
        logger.error('Failed to parse judge JSON', { raw: judgeRaw })
        throw new Error(`Judge returned invalid JSON. Raw: ${judgeRaw.slice(0, 300)}`)
      }

      await saveStep(db, runId, 'judge', 'judge', judgeRaw)
      await saveMessage(db, roomId, userId, runId, 'judge', judgeRaw)

      // ── Finalize ──────────────────────────────────────────────────────────
      await db
        .from('runs')
        .update({ status: 'done', conclusion })
        .eq('id', runId)

      logger.log('Structured debate complete', { runId })
      return { success: true, runId }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.error('Structured debate failed', { runId, error: msg })
      await db
        .from('runs')
        .update({ status: 'failed', error_message: msg })
        .eq('id', runId)
      throw err
    }
  },
})
