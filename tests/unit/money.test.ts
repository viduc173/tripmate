import { describe, expect, it } from 'vitest'
import { formatVnd, shortVnd } from '@/lib/money'

describe('formatVnd', () => {
  it('formats with dot thousands and đ suffix', () => {
    expect(formatVnd(1950000)).toBe('1.950.000đ')
    expect(formatVnd(0)).toBe('0đ')
  })
  it('rejects non-integer amounts', () => {
    expect(() => formatVnd(1.5)).toThrow()
  })
})

describe('shortVnd', () => {
  it('uses tr for millions, dropping trailing zeros', () => {
    expect(shortVnd(1950000)).toBe('1,95tr')
    expect(shortVnd(7800000)).toBe('7,8tr')
  })
  it('uses k below a million', () => {
    expect(shortVnd(650000)).toBe('650k')
  })
})
