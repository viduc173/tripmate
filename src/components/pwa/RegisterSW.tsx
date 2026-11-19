'use client'

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline viewing is a bonus; the site works without it.
    })
  }, [])
  return null
}
