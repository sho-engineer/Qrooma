'use server'

import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'
import type { Provider } from '@/types/database'

export async function saveApiKey(
  provider: Provider,
  rawKey: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  if (!rawKey.trim()) return { error: 'API key cannot be empty' }

  const encryptedKey = encrypt(rawKey.trim())

  const { error } = await supabase.from('encrypted_api_keys').upsert(
    {
      user_id: user.id,
      provider,
      encrypted_key: encryptedKey,
    },
    { onConflict: 'user_id,provider' }
  )

  if (error) {
    console.error('[saveApiKey]', error)
    return { error: error.message }
  }

  revalidatePath('/settings')
  return {}
}

export async function deleteApiKey(provider: Provider): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('encrypted_api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) {
    console.error('[deleteApiKey]', error)
    return { error: error.message }
  }

  revalidatePath('/settings')
  return {}
}

/**
 * Returns which providers have a saved key.
 * NEVER returns the encrypted_key value itself.
 */
export async function getSavedProviders(): Promise<Provider[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('encrypted_api_keys')
    .select('provider')
    .eq('user_id', user.id)

  return (data ?? []).map((row) => row.provider as Provider)
}
