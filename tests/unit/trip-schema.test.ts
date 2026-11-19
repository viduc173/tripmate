import { describe, expect, it } from 'vitest'
import { DURATION_PRESETS, TripInput } from '@/lib/trip/schema'

const sapa = {
  destinationId: 'sapa',
  startDate: '2026-11-21',
  days: 3,
  nights: 2,
  party: 4,
  budgetVnd: 8_000_000,
  budgetScope: 'group',
  transport: 'coach_grab',
}

describe('TripInput', () => {
  it('accepts a Sa Pa 3N2Đ trip', () => {
    expect(TripInput.safeParse(sapa).success).toBe(true)
  })
  it('allows nights equal to days', () => {
    expect(TripInput.safeParse({ ...sapa, nights: 3 }).success).toBe(true)
  })
  it('rejects more nights than days', () => {
    expect(TripInput.safeParse({ ...sapa, nights: 4 }).success).toBe(false)
  })
  it('rejects an empty party', () => {
    expect(TripInput.safeParse({ ...sapa, party: 0 }).success).toBe(false)
  })
  it('rejects a non-ISO date', () => {
    expect(TripInput.safeParse({ ...sapa, startDate: '21/11/2026' }).success).toBe(false)
  })
})

describe('DURATION_PRESETS', () => {
  it('has the four presets in order', () => {
    expect(DURATION_PRESETS.map((p) => [p.label, p.days, p.nights])).toEqual([
      ['Trong ngày', 1, 0],
      ['2N1Đ', 2, 1],
      ['3N2Đ', 3, 2],
      ['4N3Đ', 4, 3],
    ])
  })
})
