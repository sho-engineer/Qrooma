'use client'

import { useState, useTransition } from 'react'
import { useT } from '@/components/LocaleProvider'

interface Props {
  initial: 2 | 3
  onSave: (count: 2 | 3) => Promise<{ error?: string }>
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function AgentCountSelector({ initial, onSave }: Props) {
  const t = useT()
  const [count, setCount] = useState<2 | 3>(initial)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isPending, startTransition] = useTransition()

  function handleChange(newCount: 2 | 3) {
    setCount(newCount)
    setSaveState('saving')
    startTransition(async () => {
      const result = await onSave(newCount)
      setSaveState(result.error ? 'error' : 'saved')
      if (!result.error) {
        setTimeout(() => setSaveState('idle'), 2000)
      }
    })
  }

  const options: { value: 2 | 3; label: string; desc: string }[] = [
    { value: 2, label: t.agent2, desc: t.agent2Desc },
    { value: 3, label: t.agent3, desc: t.agent3Desc },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {t.agentCount}
        </h4>
        {saveState === 'saving' && (
          <span className="text-xs text-gray-400">{t.saving}</span>
        )}
        {saveState === 'saved' && (
          <span className="text-xs text-green-600 font-medium">{t.saved}</span>
        )}
        {saveState === 'error' && (
          <span className="text-xs text-red-500">{t.saveFailed}</span>
        )}
      </div>

      <div className="flex gap-2">
        {options.map(({ value, label, desc }) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={isPending}
            className={`flex-1 text-left px-3 py-2.5 border rounded-lg transition-colors disabled:opacity-50 ${
              count === value
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <p className={`text-sm font-medium ${count === value ? 'text-blue-800' : 'text-gray-800'}`}>
              {label}
            </p>
            <p className={`text-xs mt-0.5 ${count === value ? 'text-blue-600' : 'text-gray-500'}`}>
              {desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
