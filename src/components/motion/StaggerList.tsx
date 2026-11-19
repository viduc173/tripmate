'use client'

import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { staggerIn } from '@/lib/motion'

export function StaggerList({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null)
  useGSAP(() => {
    if (ref.current) staggerIn(Array.from(ref.current.children))
  }, { scope: ref })
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  )
}
