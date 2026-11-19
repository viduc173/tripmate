import { describe, expect, it } from 'vitest'
import { planInitialItems } from '@/lib/trip/initialItems'

const P = (id: string, category: 'sight' | 'food' | 'stay' | 'cafe' | 'market') => ({ id, category })

describe('planInitialItems', () => {
  const places = [P('s1', 'sight'), P('s2', 'sight'), P('m1', 'market'), P('f1', 'food'), P('f2', 'food'), P('h1', 'stay')]

  it('fills each day food, sight, sight, food, sight, food without repeating a place', () => {
    const items = planInitialItems(places, 1)
    expect(items.map((i) => i.place_id)).toEqual(['f1', 's1', 's2', 'f2', 'm1'])
    expect(items.map((i) => i.position)).toEqual([0, 1, 2, 3, 4])
  })
  it('never puts a stay in the day plan', () => {
    expect(planInitialItems(places, 2).some((i) => i.place_id === 'h1')).toBe(false)
  })
  it('spreads places across days and stops when they run out', () => {
    const items = planInitialItems(places, 2)
    expect(new Set(items.map((i) => i.place_id)).size).toBe(items.length)
    expect(items.every((i) => i.day_index === 0)).toBe(true)
  })
  it('no places gives no items', () => {
    expect(planInitialItems([], 3)).toEqual([])
  })
})
