'use client'

import { useState, useTransition } from 'react'
import { saveApiKey, deleteApiKey } from '@/actions/apiKeys'
import { useT } from '@/components/LocaleProvider'
import type { Provider } from '@/types/database'

const GET_KEY_URLS: Record<Provider, string> = {
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  google: 'https://aistudio.google.com/app/apikey',
}

interface Props {
  provider: Provider
  label: string
  placeholder: string
  saved: boolean
}

export function ApiKeyForm({ provider, label, placeholder, saved: initialSaved }: Props) {
  const t = useT()
  const [saved, setSaved] = useState(initialSaved)
  const [showInput, setShowInput] = useState(!initialSaved)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveApiKey(provider, value)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setShowInput(false)
        setValue('')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Remove ${label} API key?`)) return
    startTransition(async () => {
      const result = await deleteApiKey(provider)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(false)
        setShowInput(true)
      }
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {saved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {t.saved}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Get API key link */}
          <a
            href={GET_KEY_URLS[provider]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            {t.getApiKey}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          {saved && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {saved && !showInput ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">••••••••••••••••</span>
          <button
            onClick={() => setShowInput(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Update
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-2">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || !value.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? t.saving : 'Save key'}
            </button>
            {saved && (
              <button
                type="button"
                onClick={() => { setShowInput(false); setError(null); setValue('') }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
