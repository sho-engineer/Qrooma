import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

const SIDE_COLORS: Record<string, { bg: string; text: string; badge: string; label: string }> = {
  a: { bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700', label: 'Side A' },
  b: { bg: 'bg-emerald-50', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700', label: 'Side B' },
  c: { bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-700', label: 'Side C' },
}

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  // User message — right aligned
  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[70%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  // Judge message — handled separately (ConclusionCard), skip here
  if (message.side === 'judge') return null

  // AI message — left aligned with side badge
  const sideStyle = message.side ? SIDE_COLORS[message.side] : SIDE_COLORS.a

  return (
    <div className="flex items-start gap-2.5 px-4 py-1">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${sideStyle.badge}`}>
        {message.side?.toUpperCase() ?? '?'}
      </div>
      <div className="max-w-[75%]">
        <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 ${sideStyle.bg}`}>
          <p className={`text-xs font-semibold mb-1 ${sideStyle.text} opacity-70`}>
            {sideStyle.label}
          </p>
          <p className={`text-sm leading-relaxed ${sideStyle.text}`}>
            {message.content}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
