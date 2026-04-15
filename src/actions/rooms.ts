'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRoom(formData: FormData): Promise<{ error?: string; roomId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Room name is required' }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ user_id: user.id, name })
    .select()
    .single()

  if (roomError || !room) {
    console.error('[createRoom]', roomError)
    return { error: roomError?.message ?? 'Failed to create room' }
  }

  // Auto-create default room_settings
  const { error: settingsError } = await supabase.from('room_settings').insert({
    room_id: room.id,
  })

  if (settingsError) {
    console.error('[createRoom] settings insert failed', settingsError)
    // Don't fail room creation if settings insert fails - can be fixed in Settings
  }

  revalidatePath('/rooms')
  return { roomId: room.id }
}

export async function renameRoom(roomId: string, name: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Room name cannot be empty' }

  const { error } = await supabase
    .from('rooms')
    .update({ name: trimmed })
    .eq('id', roomId)
    .eq('user_id', user.id) // RLS double-check

  if (error) {
    console.error('[renameRoom]', error)
    return { error: error.message }
  }

  revalidatePath('/rooms')
  revalidatePath(`/rooms/${roomId}`)
  return {}
}

export async function deleteRoom(roomId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[deleteRoom]', error)
    return { error: error.message }
  }

  revalidatePath('/rooms')
  redirect('/rooms')
}

export async function updateRoomSettings(
  roomId: string,
  settings: {
    mode?: 'structured_debate' | 'free_talk'
    side_a_provider?: 'openai' | 'anthropic' | 'google'
    side_a_model?: string
    side_b_provider?: 'openai' | 'anthropic' | 'google'
    side_b_model?: string
    side_c_provider?: 'openai' | 'anthropic' | 'google'
    side_c_model?: string
    auto_run_on_user_message?: boolean
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  // Verify room ownership via RLS
  const { error } = await supabase
    .from('room_settings')
    .update(settings)
    .eq('room_id', roomId)

  if (error) {
    console.error('[updateRoomSettings]', error)
    return { error: error.message }
  }

  revalidatePath(`/rooms/${roomId}`)
  return {}
}
