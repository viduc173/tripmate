'use client'

import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

/** Shared motion tokens: short, transform/opacity only. */
export const MOTION = { fast: 0.25, base: 0.32, ease: 'power3.out' } as const

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Page entrance; does nothing under reduced motion so the page is already in its end state. */
export function pageEnter(el: Element): gsap.core.Tween | undefined {
  if (prefersReducedMotion()) return undefined
  return gsap.from(el, { opacity: 0, y: 12, duration: MOTION.base, ease: MOTION.ease, clearProps: 'opacity,transform' })
}

export function staggerIn(els: Element[] | NodeListOf<Element>): gsap.core.Tween | undefined {
  if (prefersReducedMotion() || els.length === 0) return undefined
  return gsap.from(els, { opacity: 0, y: 16, duration: MOTION.base, ease: MOTION.ease, stagger: 0.04, clearProps: 'opacity,transform' })
}

export type FlipState = ReturnType<typeof Flip.getState>

export function captureFlip(scope: Element | null): FlipState | null {
  if (!scope || prefersReducedMotion()) return null
  return Flip.getState(scope.querySelectorAll('[data-flip-id]'))
}

export function playFlip(state: FlipState | null): void {
  if (state) Flip.from(state, { duration: MOTION.fast, ease: MOTION.ease })
}
