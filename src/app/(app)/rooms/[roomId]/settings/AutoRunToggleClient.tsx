'use client'

import { useState, useTransition } from 'react'
import { updateRoomSettings } from '@/actions/rooms'

interface Props {
  roomId: string
  initial: boolean
}

export function AutoRunToggleClient({ roomId, initial }: Props) {
  const [enabled, setEnabled] = useState(initial)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaveState('saving')
    startTransition(async () => {
      const result = await updateRoomSettings(roomId, { auto_run_on_user_message: next })
      setSaveState(result.error ? 'error' : 'saved')
      if (!result.error) setTimeout(() => setSaveState('idle'), 2000)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Auto-run on message
        </h4>
        {saveState === 'saving' && <span className="text-xs text-gray-400">Saving...</span>}
        {saveState === 'saved' && <span className="text-xs text-green-600 font-medium">Saved</span>}
        {saveState === 'error' && <span className="text-xs text-red-500">Save failed</span>}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-300'
          } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
        <span className="text-sm text-gray-700">
          {enabled ? 'Enabled — AI runs automatically on every message' : 'Disabled — manual run only'}
        </span>
      </label>
    </div>
  )
}
