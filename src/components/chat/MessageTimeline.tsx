import { MessageBubble } from './MessageBubble'
import { ConclusionCard } from './ConclusionCard'
import type { Database, ConclusionCard as ConclusionCardType } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type Run = Database['public']['Tables']['runs']['Row']

interface Props {
  messages: Message[]
  runs: Run[]
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

  // Build a map of run conclusions by run_id for quick lookup
  const runMap = new Map<string, Run>()
  for (const run of runs) {
    runMap.set(run.id, run)
  }

  // Group messages by run to insert conclusion cards after judge messages
  const elements: React.ReactNode[] = []
  const renderedRunConclusions = new Set<string>()

  for (const msg of messages) {
    if (msg.side === 'judge' && msg.run_id && !renderedRunConclusions.has(msg.run_id)) {
      const run = runMap.get(msg.run_id)
      if (run?.conclusion && run.status === 'done') {
        renderedRunConclusions.add(msg.run_id)
        elements.push(
          <ConclusionCard
            key={`conclusion-${msg.run_id}`}
            conclusion={run.conclusion as ConclusionCardType}
            mode={run.mode}
          />
        )
      }
      continue // skip judge messages (conclusion card renders instead)
    }

    elements.push(<MessageBubble key={msg.id} message={msg} />)
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
      {elements}
    </div>
  )
}
