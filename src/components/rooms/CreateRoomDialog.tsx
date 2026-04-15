'use client'

import { useState, useTransition, useRef } from 'react'
import { createRoom } from '@/actions/rooms'
import { useRouter } from 'next/navigation'
import { useT } from '@/components/LocaleProvider'

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const t = useT()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createRoom(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        formRef.current?.reset()
        if (result.roomId) {
          router.push(`/rooms/${result.roomId}`)
        }
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 px-3 text-sm text-left text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        {t.newRoom}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold mb-4">{t.newRoomTitle}</h2>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.roomName}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder={t.roomNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(null) }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? t.creating : t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
