'use client'

import { useEffect, useRef, useState } from 'react'
import { attachBackdrop, type Program, type Uniforms } from './sharedRenderer'

type Props = { program: Program; uniforms?: Uniforms; fallback: string; className?: string }

/** Decorative animated shader background. Shows `fallback` (a CSS background) until WebGL draws. */
export function Backdrop({ program, uniforms = {}, fallback, className = '' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const key = JSON.stringify(uniforms)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    return attachBackdrop(canvas, program, JSON.parse(key) as Uniforms, () => setReady(true))
  }, [program, key])
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: fallback }}>
      <canvas
        ref={ref}
        data-testid={`backdrop-${program}`}
        className={`size-full transition-opacity duration-500 motion-reduce:transition-none ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
