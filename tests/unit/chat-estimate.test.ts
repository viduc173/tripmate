import { describe, expect, it } from 'vitest'
import { chatEstimate } from '@/lib/chat/estimate'

describe('chatEstimate', () => {
  it('splits coach, stay and daily costs, per person and group', () => {
    const e = chatEstimate({ destinationId: 'sapa', days: 3, nights: 2, party: 4, budgetVnd: 8_000_000, budgetScope: 'group', origin: 'ha-noi' })
    // coach 2 × 325k; stay 2 rooms × 2 nights × 350k ÷ 4; food 300k×3 + tickets 150k×3 + rides 30 km × 12k ÷ 4
    expect(e.rows).toEqual([
      { key: 'coach', perPerson: 650_000 },
      { key: 'stay', perPerson: 350_000, nights: 2 },
      { key: 'daily', perPerson: 1_440_000 },
    ])
    expect(e.perPerson).toBe(2_440_000)
    expect(e.total).toBe(9_760_000)
    expect(e.budget).toEqual({ ok: false, shortfallVnd: 1_760_000, perPersonBudget: 2_000_000 })
  })
  it('leaves the coach out when the origin is not Hà Nội (no fares yet)', () => {
    const e = chatEstimate({ destinationId: 'sapa', days: 1, nights: 0, party: 1, budgetVnd: 1_000_000, budgetScope: 'person', origin: 'tp-hcm' })
    expect(e.rows.map((r) => r.key)).toEqual(['daily'])
    expect(e.coachUnknown).toBe(true)
  })
})
