'use client'

import { useState, useTransition } from 'react'
import { setLocale } from '@/actions/locale'
import type { Locale } from '@/lib/i18n'

interface Props {
  current: Locale
}

export function LocaleSelector({ current }: Props) {
  const [locale, setLocaleState] = useState<Locale>(current)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Locale) {
    if (next === locale) return
    setLocaleState(next)
    setSaveState('saving')
    startTransition(async () => {
      await setLocale(next)
      setSaveState('saved')
      // Full reload so server components re-render with the new locale
      window.location.reload()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          UI Language / UI言語
        </h4>
        {saveState === 'saving' && <span className="text-xs text-gray-400">Saving...</span>}
        {saveState === 'saved' && <span className="text-xs text-green-600 font-medium">Saved</span>}
      </div>
      <div className="flex gap-2">
        {(['ja', 'en'] as Locale[]).map((l) => (
          <button
            key={l}
            onClick={() => handleChange(l)}
            disabled={isPending}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-50 ${
              locale === l
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {l === 'ja' ? '日本語' : 'English'}
          </button>
        ))}
      </div>
    </div>
  )
}
