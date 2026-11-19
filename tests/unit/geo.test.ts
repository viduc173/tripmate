import { describe, expect, it } from 'vitest'
import { haversineKm } from '@/lib/geo'

describe('haversineKm', () => {
  it('Hà Nội to Sa Pa is about 254 km in a straight line', () => {
    const km = haversineKm({ lat: 21.0285, lng: 105.8542 }, { lat: 22.3364, lng: 103.8438 })
    expect(Math.abs(km - 254)).toBeLessThanOrEqual(3)
  })
  it('same point is 0', () => {
    expect(haversineKm({ lat: 21, lng: 105 }, { lat: 21, lng: 105 })).toBe(0)
  })
})
