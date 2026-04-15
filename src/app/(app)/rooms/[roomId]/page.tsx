import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageTimeline } from '@/components/chat/MessageTimeline'
import { MessageInput } from '@/components/chat/MessageInput'
import { RunStatusBanner } from '@/components/chat/RunStatusBanner'
import type { RunStatus, Mode } from '@/types/database'

interface Props {
  params: { roomId: string }
}

const MODE_LABELS: Record<Mode, string> = {
  structured_debate: 'Structured Debate',
  free_talk: 'Free Talk',
}

const MODE_COLORS: Record<Mode, string> = {
  structured_debate: 'bg-violet-100 text-violet-700 border-violet-200',
  free_talk: 'bg-teal-100 text-teal-700 border-teal-200',
}

export default async function RoomDetailPage({ params }: Props) {
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

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  const activeRun = runs?.find(
    (r) => r.status === 'queued' || r.status === 'running'
  )
  const latestFailedRun = !activeRun
    ? runs?.slice().reverse().find((r) => r.status === 'failed')
    : null

  const mode = (settings?.mode ?? 'structured_debate') as Mode

  return (
    <div className="flex flex-col h-full">
      {/* Room header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{room.name}</h2>
          <span
            className={`flex-shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${MODE_COLORS[mode]}`}
          >
            {MODE_LABELS[mode]}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {settings && (
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
              <span
                className="px-1.5 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-600"
                title="Side A"
              >
                A:{settings.side_a_model.split('-').slice(0, 2).join('-')}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-600"
                title="Side B"
              >
                B:{settings.side_b_model.split('-').slice(0, 2).join('-')}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-mono bg-orange-50 text-orange-600"
                title="Side C"
              >
                C:{settings.side_c_model.split('-').slice(0, 2).join('-')}
              </span>
            </div>
          )}
          <Link
            href={`/rooms/${roomId}/settings`}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            ⚙ Settings
          </Link>
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

      {/* Latest failed run banner (only if no active run) */}
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
