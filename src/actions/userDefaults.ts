'use server'

/**
 * User-level default settings for new rooms.
 * Stored in Supabase auth user_metadata (no extra table needed).
 */

import { createClient } from '@/lib/supabase/server'
import type { Mode, Provider } from '@/types/database'
import { DEFAULT_MODELS } from '@/lib/ai/types'

export interface UserDefaults {
  mode: Mode
  active_agent_count: 2 | 3
  side_a_provider: Provider
  side_a_model: string
  side_b_provider: Provider
  side_b_model: string
  side_c_provider: Provider
  side_c_model: string
}

const FACTORY_DEFAULTS: UserDefaults = {
  mode: 'structured_debate',
  active_agent_count: 3,
  side_a_provider: 'openai',
  side_a_model: DEFAULT_MODELS.openai,
  side_b_provider: 'anthropic',
  side_b_model: DEFAULT_MODELS.anthropic,
  side_c_provider: 'google',
  side_c_model: DEFAULT_MODELS.google,
}

export async function getOrCreateUserDefaults(): Promise<UserDefaults> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return FACTORY_DEFAULTS

  const meta = user.user_metadata?.qrooma_defaults as UserDefaults | undefined
  return meta ? { ...FACTORY_DEFAULTS, ...meta } : FACTORY_DEFAULTS
}

export async function updateUserDefaults(
  updates: Partial<UserDefaults>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const current = (user.user_metadata?.qrooma_defaults as Partial<UserDefaults>) ?? {}
  const merged = { ...current, ...updates }

  const { error } = await supabase.auth.updateUser({
    data: { qrooma_defaults: merged },
  })

  if (error) {
    console.error('[updateUserDefaults]', error)
    return { error: error.message }
  }

  return {}
}
