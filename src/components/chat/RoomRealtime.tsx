'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  roomId: string
}

/**
 * Subscribes to Supabase Realtime for new messages in this room.
 * On INSERT, calls router.refresh() so Server Components re-fetch and
 * display AI messages as they arrive during a run.
 *
 * Renders nothing — pure side-effect component.
 */
export function RoomRealtime({ roomId }: Props) {
  const router = useRouter()
  // Debounce: batch rapid INSERTs (e.g. parallel initial opinions) into one refresh
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Debounce: wait 400 ms to coalesce parallel inserts
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            router.refresh()
          }, 400)
        }
      )
      .subscribe()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      supabase.removeChannel(channel)
    }
  }, [roomId, router])

  return null
}
