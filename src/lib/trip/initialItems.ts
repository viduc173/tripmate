type Category = 'sight' | 'food' | 'stay' | 'cafe' | 'market'
export type PlannedItem = { day_index: number; position: number; place_id: string }

const DAY_PATTERN = ['food', 'see', 'see', 'food', 'see', 'food'] as const

/**
 * First draft of a trip: fills each day with a fixed food/see rhythm from places in the given order
 * (callers pass them best-first). Stays are booked separately, never scheduled as stops.
 */
export function planInitialItems(places: { id: string; category: Category }[], days: number): PlannedItem[] {
  const queues = {
    food: places.filter((p) => p.category === 'food'),
    see: places.filter((p) => p.category === 'sight' || p.category === 'market' || p.category === 'cafe'),
  }
  const items: PlannedItem[] = []
  for (let day = 0; day < days; day++) {
    let position = 0
    for (const slot of DAY_PATTERN) {
      const next = queues[slot].shift()
      if (next) items.push({ day_index: day, position: position++, place_id: next.id })
    }
  }
  return items
}
