import { describe, expect, it } from 'vitest'
import { skyFallback, skyParams, timeForStart } from '@/lib/sky/presets'

describe('sky presets', () => {
  it('dawn start after an overnight bus, daylight otherwise', () => {
    expect(timeForStart('06:00')).toBe('sunrise')
    expect(timeForStart('08:00')).toBe('day')
  })
  it('weather sets the right layers and stays within 0..1', () => {
    const rain = skyParams('day', 'rain')
    expect(rain.rain).toBeGreaterThan(0)
    expect(rain.snow).toBe(0)
    expect(skyParams('day', 'snow').snow).toBeGreaterThan(0)
    expect(skyParams('day', 'storm').storm).toBe(1)
    expect(skyParams('day', 'clear').rain).toBe(0)
    for (const v of [...rain.top, ...rain.bottom, ...rain.ridge]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
  it('rain dims the sky compared with clear', () => {
    const sum = (c: number[]) => c.reduce((a, b) => a + b, 0)
    expect(sum(skyParams('day', 'storm').top)).not.toBe(sum(skyParams('day', 'clear').top))
  })
  it('CSS fallback is a gradient', () => {
    expect(skyFallback(skyParams('sunset', 'clear'))).toMatch(/^linear-gradient\(180deg, rgb\(/)
  })
})
