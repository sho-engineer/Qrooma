'use client'

import { useEffect, useRef } from 'react'

/**
 * Invisible anchor placed at the bottom of the message list.
 * Scrolls into view on every render (i.e. whenever new messages arrive).
 */
export function ScrollAnchor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  })

  return <div ref={ref} />
}
