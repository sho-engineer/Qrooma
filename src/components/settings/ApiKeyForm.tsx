'use client'

import { useState, useTransition } from 'react'
import { saveApiKey, deleteApiKey } from '@/actions/apiKeys'
import type { Provider } from '@/types/database'

interface Props {
  provider: Provider
  label: string
  placeholder: string
  saved: boolean
}

export function ApiKeyForm({ provider, label, placeholder, saved: initialSaved }: Props) {
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
              Saved
            </span>
          )}
        </div>
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
              {isPending ? 'Saving...' : 'Save key'}
            </button>
            {saved && (
              <button
                type="button"
                onClick={() => { setShowInput(false); setError(null); setValue('') }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
