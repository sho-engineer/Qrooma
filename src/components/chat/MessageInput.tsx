'use client'

import { useState, useRef, useTransition } from 'react'
import { sendMessage } from '@/actions/messages'

interface Props {
  roomId: string
}

export function MessageInput({ roomId }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || isPending) return
    setError(null)

    const content = value.trim()
    setValue('')

    startTransition(async () => {
      const result = await sendMessage(roomId, content)
      if (result.error) {
        setError(result.error)
        setValue(content) // restore on error
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="border-t bg-white px-4 py-3">
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message to start an AI debate... (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={isPending}
          className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className="flex-shrink-0 h-10 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '...' : 'Send'}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-1">
        Sending a message automatically starts an AI run.
      </p>
    </div>
  )
}
