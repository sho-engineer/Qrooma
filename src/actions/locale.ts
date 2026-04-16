'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Locale } from '@/lib/i18n'

export async function getLocale(): Promise<Locale> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'ja'
  return (user.user_metadata?.ui_locale as Locale) ?? 'ja'
}

export async function setLocale(locale: Locale): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase.auth.updateUser({
    data: { ui_locale: locale },
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}
