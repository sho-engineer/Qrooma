'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { retryRun } from '@/actions/messages'
import { useT } from '@/components/LocaleProvider'
import type { RunStatus } from '@/types/database'

interface Props {
  runId: string
  initialStatus: RunStatus
  errorMessage?: string | null
  mode: string
}

export function RunStatusBanner({ runId, initialStatus, errorMessage, mode }: Props) {
  const [status, setStatus] = useState<RunStatus>(initialStatus)
  const [errMsg, setErrMsg] = useState<string | null>(errorMessage ?? null)
  const [retrying, setRetrying] = useState(false)
  const router = useRouter()
  const t = useT()

  const STATUS_LABELS: Record<RunStatus, string> = {
    queued: t.statusQueued,
    running: t.statusRunning,
    done: t.statusDone,
    failed: t.statusFailed,
  }

  const modeLabel = mode === 'structured_debate' ? t.structuredDebate : t.freeTalk

  useEffect(() => {
    if (status === 'done' || status === 'failed') return

    const supabase = createClient()
    const channel = supabase
      .channel(`run-status-${runId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'runs',
          filter: `id=eq.${runId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as RunStatus
          const newErr = payload.new.error_message as string | null
          setStatus(newStatus)
          if (newErr) setErrMsg(newErr)
          if (newStatus === 'done' || newStatus === 'failed') {
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [runId, status, router])

  const handleRetry = useCallback(async () => {
    setRetrying(true)
    setErrMsg(null)
    const result = await retryRun(runId)
    if (result.error) {
      setStatus('failed')
      setErrMsg(result.error)
      setRetrying(false)
    } else {
      router.refresh()
    }
  }, [runId, router])

  if (status === 'done') return null

  return (
    <div
      className={`mx-4 my-2 px-4 py-3 rounded-xl text-sm flex items-center justify-between ${
        status === 'failed'
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-amber-50 border border-amber-200 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {(status === 'queued' || status === 'running') && (
          <span className="inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        )}
        <span className="font-medium">{STATUS_LABELS[status]}</span>
        {status !== 'failed' && (
          <span className="text-xs text-amber-600">— {modeLabel}</span>
        )}
      </div>

      {status === 'failed' && (
        <div className="flex items-center gap-3">
          {errMsg && <span className="text-xs truncate max-w-xs">{errMsg}</span>}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {retrying ? t.retrying : t.retry}
          </button>
        </div>
      )}
    </div>
  )
}
