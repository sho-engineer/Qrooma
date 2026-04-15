'use client'

import { useState, useTransition } from 'react'
import type { Mode } from '@/types/database'

interface Props {
  initialMode: Mode
  onSave: (mode: Mode) => Promise<{ error?: string }>
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const MODES: { value: Mode; label: string; description: string }[] = [
  {
    value: 'structured_debate',
    label: 'Structured Debate',
    description: 'Initial opinions → Critiques → Revisions → Judge conclusion',
  },
  {
    value: 'free_talk',
    label: 'Free Talk',
    description: 'AIs take turns discussing freely. Up to 3 rounds.',
  },
]

export function DefaultModeSelector({ initialMode, onSave }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isPending, startTransition] = useTransition()

  function handleChange(newMode: Mode) {
    setMode(newMode)
    setSaveState('saving')
    startTransition(async () => {
      const result = await onSave(newMode)
      setSaveState(result.error ? 'error' : 'saved')
      if (!result.error) {
        setTimeout(() => setSaveState('idle'), 2000)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Default Mode
        </h4>
        {saveState === 'saving' && (
          <span className="text-xs text-gray-400">Saving...</span>
        )}
        {saveState === 'saved' && (
          <span className="text-xs text-green-600 font-medium">Saved</span>
        )}
        {saveState === 'error' && (
          <span className="text-xs text-red-500">Save failed</span>
        )}
      </div>

      <div className="space-y-2">
        {MODES.map(({ value, label, description }) => (
          <label
            key={value}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              mode === value
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input
              type="radio"
              name="default-mode"
              value={value}
              checked={mode === value}
              onChange={() => handleChange(value)}
              className="mt-0.5 accent-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
