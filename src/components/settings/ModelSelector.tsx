'use client'

import { useState, useTransition } from 'react'
import { MODELS_BY_PROVIDER, DEFAULT_MODELS } from '@/lib/ai/types'
import type { Provider, Mode } from '@/types/database'

type SaveFn = (updates: {
  side_a_provider?: Provider
  side_a_model?: string
  side_b_provider?: Provider
  side_b_model?: string
  side_c_provider?: Provider
  side_c_model?: string
}) => Promise<{ error?: string }>

interface SideConfig {
  provider: Provider
  model: string
}

interface Props {
  roomId: string
  initial: {
    side_a: SideConfig
    side_b: SideConfig
    side_c: SideConfig
  }
  onSave: SaveFn
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const SIDE_LABELS: Record<string, { label: string; color: string }> = {
  a: { label: 'Side A', color: 'text-blue-700' },
  b: { label: 'Side B', color: 'text-emerald-700' },
  c: { label: 'Side C', color: 'text-orange-700' },
}

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
}

export function ModelSelector({ roomId, initial, onSave }: Props) {
  const [config, setConfig] = useState(initial)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isPending, startTransition] = useTransition()

  function handleChange(
    side: 'a' | 'b' | 'c',
    field: 'provider' | 'model',
    value: string
  ) {
    const updated = { ...config }

    if (field === 'provider') {
      updated[`side_${side}`] = {
        provider: value as Provider,
        model: DEFAULT_MODELS[value as Provider],
      }
    } else {
      updated[`side_${side}`] = {
        ...updated[`side_${side}`],
        model: value,
      }
    }

    setConfig(updated)

    setSaveState('saving')
    startTransition(async () => {
      const result = await onSave({
        side_a_provider: updated.side_a.provider,
        side_a_model: updated.side_a.model,
        side_b_provider: updated.side_b.provider,
        side_b_model: updated.side_b.model,
        side_c_provider: updated.side_c.provider,
        side_c_model: updated.side_c.model,
      })
      setSaveState(result.error ? 'error' : 'saved')
      if (!result.error) {
        setTimeout(() => setSaveState('idle'), 2000)
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          AI Sides
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

      {(['a', 'b', 'c'] as const).map((side) => {
        const key = `side_${side}` as const
        const { provider, model } = config[key]
        const sideInfo = SIDE_LABELS[side]

        return (
          <div key={side} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${side === 'a' ? 'bg-blue-100 text-blue-700' : ''}
                  ${side === 'b' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${side === 'c' ? 'bg-orange-100 text-orange-700' : ''}
                `}
              >
                {side.toUpperCase()}
              </div>
              <span className={`text-sm font-medium ${sideInfo.color}`}>
                {sideInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Provider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => handleChange(side, 'provider', e.target.value)}
                  disabled={isPending}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                >
                  {(['openai', 'anthropic', 'google'] as Provider[]).map((p) => (
                    <option key={p} value={p}>
                      {PROVIDER_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => handleChange(side, 'model', e.target.value)}
                  disabled={isPending}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                >
                  {MODELS_BY_PROVIDER[provider].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
