'use client'

import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { pageEnter } from '@/lib/motion'

/** Remounts on every navigation, so each page gets the same short entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (ref.current) pageEnter(ref.current)
  }, { scope: ref })
  return (
    <div ref={ref} data-page>
      {children}
    </div>
  )
}
