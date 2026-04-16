import { task, logger } from '@trigger.dev/sdk/v3'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/crypto'
import { callSide } from '@/lib/ai'
import type { SideConfig, ConclusionCard, Provider } from '@/lib/ai/types'

export interface FreeTalkTaskPayload {
  runId: string
  roomId: string
  userId: string
  userMessage: string
  /** Language detected from the user's first message. Used to lock all AI responses. */
  discussionLanguage?: string
  /** Number of active AI sides: 2 (A+B) or 3 (A+B+C). Default 3. */
  activeAgentCount?: 2 | 3
  settings: {
    side_a_provider: Provider
    side_a_model: string
    side_b_provider: Provider
    side_b_model: string
    side_c_provider: Provider
    side_c_model: string
  }
}

function langInstruction(lang: string): string {
  if (lang === 'Japanese') return '必ず日本語で回答してください。\n\n'
  return ''
}

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

function extractJson(raw: string): string {
  let s = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  if (s.startsWith('{')) return s
  const match = s.match(/\{[\s\S]*\}/)
  if (match) return match[0]
  return s
}

const JUDGE_SCHEMA = `{
  "conclusion": "string",
  "rationale": "string",
  "risks": ["string"],
  "disagreements": ["string"],
  "unknowns": ["string"],
  "next_actions": ["string"]
}`

const MAX_ROUNDS = 3
const CONVERGENCE_KEYWORDS = /\b(agree|consensus|same|concur|aligned|consistent)\b/i

export const freeTalkTask = task({
  id: 'free-talk',
  maxDuration: 300,
  run: async (payload: FreeTalkTaskPayload) => {
    const {
      runId, roomId, userId, userMessage, settings,
      discussionLanguage = 'English',
      activeAgentCount = 3,
    } = payload
    const lang = langInstruction(discussionLanguage)
    const db = getDb()

    logger.log('Starting free talk', { runId, roomId, activeAgentCount })

    await db.from('runs').update({ status: 'running' }).eq('id', runId)

    // Build side configs only for active sides — avoids fetching unused API keys
    const activeSideKeys = (['a', 'b', 'c'] as const).slice(0, activeAgentCount)

    let sideConfigs: SideConfig[]
    try {
      sideConfigs = await Promise.all(
        activeSideKeys.map(async (side) => ({
          side,
          provider: settings[`side_${side}_provider`],
          model: settings[`side_${side}_model`],
          apiKey: await getDecryptedKey(db, userId, settings[`side_${side}_provider`]),
        }))
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await db.from('runs').update({ status: 'failed', error_message: msg }).eq('id', runId)
      throw err
    }

    try {
      const conversationHistory: Array<{ side: string; content: string }> = []
      let converged = false

      for (let round = 0; round < MAX_ROUNDS && !converged; round++) {
        logger.log(`Free talk round ${round + 1}`)

        for (const cfg of sideConfigs) {
          const historyText =
            conversationHistory.length > 0
              ? conversationHistory
                  .map((h) => `Side ${h.side.toUpperCase()}: ${h.content}`)
                  .join('\n\n')
              : 'No prior messages.'

          const content = await callSide(cfg, [
            {
              role: 'system',
              content: `${lang}You are AI Side ${cfg.side.toUpperCase()} in a free-form discussion. Engage thoughtfully with others' ideas. Build on points of agreement, challenge disagreements, and help move toward shared understanding. Keep responses concise (100-150 words).`,
            },
            {
              role: 'user',
              content: `Topic: ${userMessage}\n\nConversation so far:\n${historyText}\n\nYour turn (Side ${cfg.side.toUpperCase()}):`,
            },
          ])

          conversationHistory.push({ side: cfg.side, content })

          // Save step and message
          await db.from('run_steps').insert({
            run_id: runId,
            step_type: 'turn',
            side: cfg.side,
            content,
            metadata: { round: round + 1 },
          })
          await db.from('messages').insert({
            room_id: roomId,
            user_id: userId,
            role: 'ai',
            side: cfg.side,
            content,
            run_id: runId,
          })

          logger.log(`Side ${cfg.side} spoke in round ${round + 1}`)
        }

        // Check convergence: if all active sides' last messages contain agreement keywords
        const lastN = conversationHistory.slice(-activeAgentCount)
        if (
          lastN.length === activeAgentCount &&
          lastN.every((h) => CONVERGENCE_KEYWORDS.test(h.content))
        ) {
          logger.log('Convergence detected, ending early')
          converged = true
        }
      }

      // ── Judge synthesis ───────────────────────────────────────────────────
      logger.log('Judge synthesis')
      const judgeConfig = sideConfigs[0]
      const fullConversation = conversationHistory
        .map((h) => `Side ${h.side.toUpperCase()}: ${h.content}`)
        .join('\n\n')

      const judgePrompt = `You are a neutral Judge reviewing a free-form AI discussion.

Original topic: ${userMessage}

Full conversation:
${fullConversation}

Synthesize the discussion into a conclusion. Respond with ONLY valid JSON:
${JUDGE_SCHEMA}`

      const judgeRaw = await callSide(judgeConfig, [
        {
          role: 'system',
          content: `${lang}You are a neutral judge. Respond only with valid JSON.`,
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

      await db.from('run_steps').insert({
        run_id: runId,
        step_type: 'judge',
        side: 'judge',
        content: judgeRaw,
      })
      await db.from('messages').insert({
        room_id: roomId,
        user_id: userId,
        role: 'ai',
        side: 'judge',
        content: judgeRaw,
        run_id: runId,
      })

      await db.from('runs').update({ status: 'done', conclusion }).eq('id', runId)

      logger.log('Free talk complete', { runId, rounds: MAX_ROUNDS, converged })
      return { success: true, runId, converged }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logger.error('Free talk failed', { runId, error: msg })
      await db.from('runs').update({ status: 'failed', error_message: msg }).eq('id', runId)
      throw err
    }
  },
})
