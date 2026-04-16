'use server'

import { createClient } from '@/lib/supabase/server'
import { tasks } from '@trigger.dev/sdk/v3'
import { revalidatePath } from 'next/cache'
import type { Provider } from '@/types/database'

/**
 * Detect the primary language of a message for run-level language locking.
 * Returns a natural language name used in AI system prompts.
 */
function detectDiscussionLanguage(text: string): string {
  // Japanese: hiragana, katakana, CJK unified ideographs
  if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(text)) return 'Japanese'
  return 'English'
}

export async function sendMessage(
  roomId: string,
  content: string
): Promise<{ error?: string; runId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }

  // 1. Fetch room settings
  const { data: settings, error: settingsError } = await supabase
    .from('room_settings')
    .select('*')
    .eq('room_id', roomId)
    .single()

  if (settingsError || !settings) {
    console.error('[sendMessage] room_settings not found', settingsError)
    return { error: 'Room settings not found. Please reconfigure the room.' }
  }

  // 2. Insert user message
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({ room_id: roomId, user_id: user.id, role: 'user', content: trimmed })
    .select()
    .single()

  if (msgError || !message) {
    console.error('[sendMessage] message insert failed', msgError)
    return { error: 'Failed to send message' }
  }

  // 3. If auto_run is disabled, just send the message
  if (!settings.auto_run_on_user_message) {
    revalidatePath(`/rooms/${roomId}`)
    return {}
  }

  // 4. Create run record
  const { data: run, error: runError } = await supabase
    .from('runs')
    .insert({
      room_id: roomId,
      user_id: user.id,
      status: 'queued',
      mode: settings.mode,
      trigger_message_id: message.id,
    })
    .select()
    .single()

  if (runError || !run) {
    console.error('[sendMessage] run insert failed', runError)
    return { error: 'Failed to create run' }
  }

  // 5. Dispatch Trigger.dev task
  // IMPORTANT: never pass decrypted API keys in payload - decrypt inside the task
  const taskPayload = {
    runId: run.id,
    roomId,
    userId: user.id,
    userMessage: trimmed,
    discussionLanguage: detectDiscussionLanguage(trimmed),
    activeAgentCount: (settings.active_agent_count ?? 3) as 2 | 3,
    settings: {
      side_a_provider: settings.side_a_provider as Provider,
      side_a_model: settings.side_a_model,
      side_b_provider: settings.side_b_provider as Provider,
      side_b_model: settings.side_b_model,
      side_c_provider: settings.side_c_provider as Provider,
      side_c_model: settings.side_c_model,
    },
  }

  try {
    const taskId =
      settings.mode === 'structured_debate' ? 'structured-debate' : 'free-talk'
    const handle = await tasks.trigger(taskId, taskPayload)

    // 6. Save Trigger.dev handle ID for status tracking
    await supabase
      .from('runs')
      .update({ trigger_run_id: handle.id })
      .eq('id', run.id)
  } catch (err) {
    console.error('[sendMessage] trigger failed', err)
    // Mark run as failed if we can't dispatch the task
    await supabase
      .from('runs')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Failed to start task',
      })
      .eq('id', run.id)
    return { error: 'Failed to start AI run. Check your Trigger.dev configuration.' }
  }

  revalidatePath(`/rooms/${roomId}`)
  return { runId: run.id }
}

export async function retryRun(runId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  // Fetch the original run (owned by this user)
  const { data: run, error: runError } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .eq('user_id', user.id)
    .single()

  if (runError || !run) return { error: 'Run not found' }
  if (!run.trigger_message_id) return { error: 'Original message not found' }

  // Fetch the trigger message content
  const { data: triggerMsg } = await supabase
    .from('messages')
    .select('content')
    .eq('id', run.trigger_message_id)
    .single()

  if (!triggerMsg) return { error: 'Original message not found' }

  // Fetch room settings separately (no direct FK from runs → room_settings)
  const { data: settings } = await supabase
    .from('room_settings')
    .select('*')
    .eq('room_id', run.room_id)
    .single()

  if (!settings) return { error: 'Room settings not found' }

  // Create a NEW run — do NOT patch the existing run; preserve history
  const { data: newRun, error: newRunError } = await supabase
    .from('runs')
    .insert({
      room_id: run.room_id,
      user_id: user.id,
      status: 'queued',
      mode: run.mode,
      trigger_message_id: run.trigger_message_id,
    })
    .select()
    .single()

  if (newRunError || !newRun) return { error: 'Failed to create retry run' }

  const taskPayload = {
    runId: newRun.id,
    roomId: run.room_id,
    userId: user.id,
    userMessage: triggerMsg.content,
    discussionLanguage: detectDiscussionLanguage(triggerMsg.content),
    activeAgentCount: (settings.active_agent_count ?? 3) as 2 | 3,
    settings: {
      side_a_provider: settings.side_a_provider as Provider,
      side_a_model: settings.side_a_model,
      side_b_provider: settings.side_b_provider as Provider,
      side_b_model: settings.side_b_model,
      side_c_provider: settings.side_c_provider as Provider,
      side_c_model: settings.side_c_model,
    },
  }

  try {
    const taskId = run.mode === 'structured_debate' ? 'structured-debate' : 'free-talk'
    const handle = await tasks.trigger(taskId, taskPayload)
    await supabase.from('runs').update({ trigger_run_id: handle.id }).eq('id', newRun.id)
  } catch (err) {
    await supabase
      .from('runs')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Failed to start retry run',
      })
      .eq('id', newRun.id)
    return { error: 'Failed to start retry run' }
  }

  revalidatePath(`/rooms/${run.room_id}`)
  return {}
}
