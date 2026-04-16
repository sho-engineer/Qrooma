'use client'

import { useState, useTransition } from 'react'
import { MODELS_BY_PROVIDER, DEFAULT_MODELS } from '@/lib/ai/types'
import { useT } from '@/components/LocaleProvider'
import type { Provider } from '@/types/database'

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
  activeAgentCount: 2 | 3
  onSave: SaveFn
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
}

const SIDE_BADGE: Record<'a' | 'b' | 'c', string> = {
  a: 'bg-blue-100 text-blue-700',
  b: 'bg-emerald-100 text-emerald-700',
  c: 'bg-orange-100 text-orange-700',
}
const SIDE_TEXT: Record<'a' | 'b' | 'c', string> = {
  a: 'text-blue-700',
  b: 'text-emerald-700',
  c: 'text-orange-700',
}

export function ModelSelector({ roomId, initial, activeAgentCount, onSave }: Props) {
  const t = useT()
  const [config, setConfig] = useState(initial)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [dupeError, setDupeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const SIDES: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c']
  const SIDE_LABELS: Record<'a' | 'b' | 'c', string> = {
    a: t.sideA,
    b: t.sideB,
    c: t.sideC,
  }

  /** Returns the set of "provider:model" used by all OTHER active sides */
  function usedCombos(excludeSide: 'a' | 'b' | 'c'): Set<string> {
    const activeSides = (activeAgentCount === 2 ? (['a', 'b'] as const) : (['a', 'b', 'c'] as const))
    return new Set(
      activeSides
        .filter((s) => s !== excludeSide)
        .map((s) => `${config[`side_${s}`].provider}:${config[`side_${s}`].model}`)
    )
  }

  function handleChange(
    side: 'a' | 'b' | 'c',
    field: 'provider' | 'model',
    value: string
  ) {
    setDupeError(null)

    const updated = { ...config }
    if (field === 'provider') {
      updated[`side_${side}`] = {
        provider: value as Provider,
        model: DEFAULT_MODELS[value as Provider],
      }
    } else {
      updated[`side_${side}`] = { ...updated[`side_${side}`], model: value }
    }

    // Duplicate check against active sides
    const combo = `${updated[`side_${side}`].provider}:${updated[`side_${side}`].model}`
    if (usedCombos(side).has(combo)) {
      setDupeError(t.duplicateModel)
      return // Don't save
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
      if (!result.error) setTimeout(() => setSaveState('idle'), 2000)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {t.aiSides}
        </h4>
        {saveState === 'saving' && <span className="text-xs text-gray-400">{t.saving}</span>}
        {saveState === 'saved' && <span className="text-xs text-green-600 font-medium">{t.saved}</span>}
        {saveState === 'error' && <span className="text-xs text-red-500">{t.saveFailed}</span>}
      </div>

      {dupeError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {dupeError}
        </p>
      )}

      {SIDES.map((side) => {
        const key = `side_${side}` as const
        const { provider, model } = config[key]
        const disabled = side === 'c' && activeAgentCount === 2
        const combosUsedByOthers = usedCombos(side)

        return (
          <div
            key={side}
            className={`border rounded-lg p-3 transition-opacity ${
              disabled ? 'border-gray-100 opacity-40' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${SIDE_BADGE[side]}`}>
                {side.toUpperCase()}
              </div>
              <span className={`text-sm font-medium ${SIDE_TEXT[side]}`}>
                {SIDE_LABELS[side]}
              </span>
              {disabled && (
                <span className="ml-auto text-xs text-gray-400">{t.sideDisabled}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Provider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t.providerLabel}</label>
                <select
                  value={provider}
                  onChange={(e) => handleChange(side, 'provider', e.target.value)}
                  disabled={isPending || disabled}
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
                <label className="block text-xs text-gray-500 mb-1">{t.modelLabel}</label>
                <select
                  value={model}
                  onChange={(e) => handleChange(side, 'model', e.target.value)}
                  disabled={isPending || disabled}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                >
                  {MODELS_BY_PROVIDER[provider].map((m) => {
                    const isDupe = combosUsedByOthers.has(`${provider}:${m}`)
                    return (
                      <option key={m} value={m} disabled={isDupe}>
                        {isDupe ? `${m} ✕` : m}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
