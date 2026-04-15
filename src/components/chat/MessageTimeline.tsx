import { MessageBubble } from './MessageBubble'
import { ConclusionCard } from './ConclusionCard'
import { ScrollAnchor } from './ScrollAnchor'
import type { Database, ConclusionCard as ConclusionCardType, Mode } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type Run = Database['public']['Tables']['runs']['Row']

interface Props {
  messages: Message[]
  runs: Run[]
}

const MODE_LABELS: Record<Mode, string> = {
  structured_debate: 'Structured Debate',
  free_talk: 'Free Talk',
}

/** Status label mapping for display */
const RUN_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  queued:  { label: 'Queued',    className: 'text-amber-600 bg-amber-50 border-amber-200' },
  running: { label: 'Running',   className: 'text-amber-700 bg-amber-50 border-amber-200' },
  done:    { label: 'Completed', className: 'text-green-700 bg-green-50 border-green-200' },
  failed:  { label: 'Error',     className: 'text-red-700 bg-red-50 border-red-200' },
}

export function MessageTimeline({ messages, runs }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-8">
        <div>
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 font-medium">Start the discussion</p>
          <p className="text-gray-400 text-sm mt-1">
            Send a message and your AI team will start debating.
          </p>
        </div>
      </div>
    )
  }

  // Build fast-lookup maps
  const runMap = new Map<string, Run>(runs.map((r) => [r.id, r]))

  // Group messages: top-level user messages without run_id, and runs
  // Strategy:
  // 1. Show user messages that are trigger_message_id for a run, before that run group
  // 2. Show run group (AI messages + ConclusionCard) for each run in order
  // 3. Show lone user messages (no associated run) inline

  // Determine which message IDs are trigger messages for runs
  const triggerMessageIds = new Set(
    runs.map((r) => r.trigger_message_id).filter(Boolean) as string[]
  )

  // Separate user messages and AI messages
  const userMessages = messages.filter((m) => m.role === 'user')
  const aiMessagesByRunId = new Map<string, Message[]>()
  for (const m of messages) {
    if (m.role === 'ai' && m.run_id) {
      const arr = aiMessagesByRunId.get(m.run_id) ?? []
      arr.push(m)
      aiMessagesByRunId.set(m.run_id, arr)
    }
  }

  // Build ordered render groups
  // We walk runs in order, preceding each with its trigger user message
  const renderedMsgIds = new Set<string>()

  type RenderItem =
    | { type: 'user_message'; message: Message }
    | { type: 'run_group'; run: Run; runIndex: number; aiMessages: Message[] }
    | { type: 'lone_user_message'; message: Message }

  const items: RenderItem[] = []
  let runIndex = 0

  for (const run of runs) {
    // Show trigger user message before this run group
    if (run.trigger_message_id) {
      const triggerMsg = messages.find((m) => m.id === run.trigger_message_id)
      if (triggerMsg && !renderedMsgIds.has(triggerMsg.id)) {
        items.push({ type: 'user_message', message: triggerMsg })
        renderedMsgIds.add(triggerMsg.id)
      }
    }

    const aiMessages = aiMessagesByRunId.get(run.id) ?? []
    runIndex++
    items.push({ type: 'run_group', run, runIndex, aiMessages })
  }

  // Any remaining user messages not yet rendered (no associated run)
  for (const msg of userMessages) {
    if (!renderedMsgIds.has(msg.id)) {
      items.push({ type: 'lone_user_message', message: msg })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {items.map((item, i) => {
        if (item.type === 'user_message' || item.type === 'lone_user_message') {
          return <MessageBubble key={item.message.id} message={item.message} />
        }

        const { run, runIndex: idx, aiMessages } = item
        const statusInfo = RUN_STATUS_LABELS[run.status] ?? RUN_STATUS_LABELS.queued
        const modeLabel = MODE_LABELS[run.mode] ?? run.mode

        return (
          <div key={run.id} className="my-3">
            {/* Run divider */}
            <div className="flex items-center gap-3 px-4 mb-2">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">Run #{idx}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-500">{modeLabel}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded border ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* AI messages for this run (exclude judge) */}
            <div className="space-y-0.5">
              {aiMessages
                .filter((m) => m.side !== 'judge')
                .map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
            </div>

            {/* Conclusion card (if run is done) */}
            {run.status === 'done' && run.conclusion && (
              <ConclusionCard
                conclusion={run.conclusion as ConclusionCardType}
                mode={run.mode}
              />
            )}

            {/* Error state for failed run */}
            {run.status === 'failed' && (
              <div className="mx-4 my-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <span className="font-medium">Run failed</span>
                {run.error_message && (
                  <span className="ml-2 text-xs">{run.error_message}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
      <ScrollAnchor />
    </div>
  )
}
