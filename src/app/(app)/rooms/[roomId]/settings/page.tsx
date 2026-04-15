import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RoomSettingsForm } from './RoomSettingsForm'

interface Props {
  params: { roomId: string }
}

export default async function RoomSettingsPage({ params }: Props) {
  const { roomId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room) notFound()

  const { data: settings } = await supabase
    .from('room_settings')
    .select('*')
    .eq('room_id', roomId)
    .single()

  if (!settings) notFound()

  return (
    <div className="p-6 max-w-2xl overflow-y-auto h-full">
      <div className="mb-6 flex items-center gap-3">
        <a
          href={`/rooms/${roomId}`}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </a>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Room Settings</p>
        </div>
      </div>

      <RoomSettingsForm roomId={roomId} settings={settings} />
    </div>
  )
}
