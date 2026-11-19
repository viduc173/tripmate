import { describe, expect, it } from 'vitest'
import { reorder } from '@/lib/schedule/reorder'
import { buildItineraryView, type ItineraryInput } from '@/lib/itinerary/view'

describe('reorder', () => {
  it('moves the first item to the end', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })
  it('moves down by one', () => {
    expect(reorder(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
  })
  it('does not mutate the input', () => {
    const xs = ['a', 'b']
    reorder(xs, 0, 1)
    expect(xs).toEqual(['a', 'b'])
  })
  it('throws on an out-of-range index', () => {
    expect(() => reorder(['a', 'b'], 0, 2)).toThrow(RangeError)
    expect(() => reorder(['a', 'b'], -1, 0)).toThrow(RangeError)
  })
})

const KM = 111.195
const place = (id: string, km: number, durationMin: number, priceVnd = 0) => ({
  id, name: id.toUpperCase(), category: 'sight' as const, durationMin, priceVnd, lat: 22.3 + km / KM, lng: 103.84,
})

const input: ItineraryInput = {
  startDate: '2026-11-21',
  days: 2,
  nights: 1,
  party: 4,
  transport: 'coach_grab',
  budgetVnd: 8_000_000,
  budgetScope: 'group',
  outbound: { operator: 'Nhà xe A', departTime: '22:00', arriveTime: '05:30', overnight: true, priceVnd: 300_000 },
  return: { operator: 'Nhà xe A', departTime: '15:00', arriveTime: '21:00', overnight: false, priceVnd: 300_000 },
  items: [
    { dayIndex: 0, position: 0, itemId: 'i1', place: place('a', 0, 60, 100_000) },
    { dayIndex: 0, position: 1, itemId: 'i2', place: place('b', 3, 150) },
    { dayIndex: 1, position: 0, itemId: 'i3', place: place('c', 0, 60) },
  ],
}

describe('buildItineraryView', () => {
  it('starts an overnight-bus first day light, at 06:00', () => {
    const v = buildItineraryView(input)
    expect(v.days[0]).toMatchObject({ date: '2026-11-21', light: true, startTime: '06:00' })
    expect(v.days[0].stops.map((s) => s.start)).toEqual(['06:00', '07:10'])
    expect(v.days[1].stops.map((s) => s.start)).toEqual(['08:00'])
  })
  it('reordering a day changes its times', () => {
    const swapped = { ...input, items: input.items.map((i) => (i.itemId === 'i1' ? { ...i, position: 1 } : i.itemId === 'i2' ? { ...i, position: 0 } : i)) }
    expect(buildItineraryView(swapped).days[0].stops.map((s) => [s.place.id, s.start])).toEqual([
      ['b', '06:00'],
      ['a', '08:40'],
    ])
  })
  it('costs legs per person, tickets per person, and compares with the budget', () => {
    const v = buildItineraryView(input)
    expect(v.cost.legs).toBe(2_400_000)
    expect(v.cost.tickets).toBe(400_000)
    expect(v.cost.perPerson * 4).toBeGreaterThanOrEqual(v.cost.total)
    expect(v.budget.ok).toBe(v.cost.total <= 8_000_000)
  })
  it('does not count a food stop price twice (daily food allowance covers meals)', () => {
    const withFood = { ...input, items: [...input.items, { dayIndex: 1, position: 1, itemId: 'i4', place: { ...place('f', 1, 45, 80_000), category: 'food' as const } }] }
    expect(buildItineraryView(withFood).cost.tickets).toBe(400_000)
  })
})
