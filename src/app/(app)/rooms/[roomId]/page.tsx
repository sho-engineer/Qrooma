import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MessageTimeline } from '@/components/chat/MessageTimeline'
import { MessageInput } from '@/components/chat/MessageInput'
import { RunStatusBanner } from '@/components/chat/RunStatusBanner'
import type { RunStatus } from '@/types/database'

interface Props {
  params: { roomId: string }
}

export default async function RoomDetailPage({ params }: Props) {
  const { roomId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch room (RLS ensures it belongs to this user)
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (!room) notFound()

  // Fetch room settings
  const { data: settings } = await supabase
    .from('room_settings')
    .select('*')
    .eq('room_id', roomId)
    .single()

  // Fetch messages (chronological)
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  // Fetch runs for this room (to get conclusions)
  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  const activeRun = runs?.find(
    (r) => r.status === 'queued' || r.status === 'running'
  )
  const latestFailedRun = !activeRun
    ? runs?.findLast((r) => r.status === 'failed')
    : null

  const modeLabel =
    settings?.mode === 'structured_debate' ? 'Structured Debate' : 'Free Talk'

  return (
    <div className="flex flex-col h-full">
      {/* Room header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-white">
        <div>
          <h2 className="font-semibold text-gray-900">{room.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{modeLabel}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>
            A: {settings?.side_a_model ?? '—'} &bull; B: {settings?.side_b_model ?? '—'} &bull; C:{' '}
            {settings?.side_c_model ?? '—'}
          </span>
        </div>
      </div>

      {/* Active run status */}
      {activeRun && (
        <RunStatusBanner
          runId={activeRun.id}
          initialStatus={activeRun.status as RunStatus}
          mode={activeRun.mode}
        />
      )}

      {/* Latest failed run */}
      {latestFailedRun && (
        <RunStatusBanner
          runId={latestFailedRun.id}
          initialStatus="failed"
          errorMessage={latestFailedRun.error_message}
          mode={latestFailedRun.mode}
        />
      )}

      {/* Message timeline */}
      <MessageTimeline messages={messages ?? []} runs={runs ?? []} />

      {/* Message input */}
      <MessageInput roomId={roomId} />
    </div>
  )
}
