import { describe, expect, it } from 'vitest'
import { carsFor, estimateTrip, roomsFor, type CostInput } from '@/lib/cost/estimate'
import { checkBudget } from '@/lib/cost/budget'

const sapa: CostInput = {
  party: 4,
  nights: 2,
  roomPriceVnd: 200_000,
  legs: [{ priceVnd: 325_000 }, { priceVnd: 325_000 }],
  items: [
    { priceVnd: 150_000, rideKm: 3 },
    { priceVnd: 0, rideKm: 2 },
  ],
  transport: 'coach_grab',
  foodPerPersonPerDayVnd: 300_000,
  days: 3,
}

describe('roomsFor', () => {
  it('puts 2 people per room, rounding up', () => {
    expect([1, 3, 4, 5].map(roomsFor)).toEqual([1, 2, 2, 3])
  })
})

describe('carsFor', () => {
  it('switches to 7 seats at 5 people and to 2 cars above 7', () => {
    expect(carsFor(4)).toEqual({ seats: 4, count: 1 })
    expect(carsFor(5)).toEqual({ seats: 7, count: 1 })
    expect(carsFor(8)).toEqual({ seats: 7, count: 2 })
  })
})

describe('estimateTrip', () => {
  it('matches the Sa Pa example', () => {
    expect(estimateTrip(sapa)).toEqual({
      lodging: 800_000,
      legs: 2_600_000,
      tickets: 600_000,
      rides: 60_000,
      food: 3_600_000,
      total: 7_660_000,
      perPerson: 1_915_000,
    })
  })
  it('no nights means no lodging (overnight bus is not a night)', () => {
    expect(estimateTrip({ ...sapa, nights: 0 }).lodging).toBe(0)
  })
  it('motorbike rides use fuel per bike, not Grab', () => {
    // 5 km × 1,000đ × 2 bikes
    expect(estimateTrip({ ...sapa, transport: 'motorbike' }).rides).toBe(10_000)
  })
  it('odd party sizes: per person rounds up and covers the total', () => {
    for (const party of [1, 3, 5, 8]) {
      const b = estimateTrip({ ...sapa, party })
      expect(b.perPerson * party).toBeGreaterThanOrEqual(b.total)
      expect(b.perPerson * party - b.total).toBeLessThan(party)
    }
  })
})

describe('checkBudget', () => {
  const b = estimateTrip(sapa)
  it('group budget above total is ok', () => {
    expect(checkBudget(8_000_000, 'group', 4, b)).toEqual({ ok: true, shortfallVnd: 0, perPersonBudget: 2_000_000 })
  })
  it('per-person budget compares per person and reports shortfall per person', () => {
    expect(checkBudget(1_500_000, 'person', 4, b)).toEqual({ ok: false, shortfallVnd: 415_000, perPersonBudget: 1_500_000 })
  })
  it('group budget below total reports group shortfall', () => {
    expect(checkBudget(7_000_000, 'group', 4, b)).toEqual({ ok: false, shortfallVnd: 660_000, perPersonBudget: 1_750_000 })
  })
})
