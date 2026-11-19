import { checkBudget, type BudgetScope } from '@/lib/cost/budget'
import { estimateTrip, type CostBreakdown, type Transport } from '@/lib/cost/estimate'
import { DEFAULT_ROOM_PER_NIGHT, FOOD_PER_PERSON_PER_DAY } from '@/lib/cost/rates'
import { buildTripDays } from '@/lib/schedule/buildTripDays'
import { scheduleDay } from '@/lib/schedule/scheduleDay'

export type ViewPlace = {
  id: string
  name: string
  category: 'sight' | 'food' | 'stay' | 'cafe' | 'market'
  durationMin: number
  priceVnd: number
  lat: number
  lng: number
}

export type Leg = { operator: string; departTime: string; arriveTime: string; overnight: boolean; priceVnd: number }

export type ItineraryInput = {
  startDate: string
  days: number
  nights: number
  party: number
  transport: Transport
  budgetVnd: number
  budgetScope: BudgetScope
  roomPriceVnd?: number
  outbound?: Leg
  return?: Leg
  items: { itemId: string; dayIndex: number; position: number; place: ViewPlace }[]
}

export type ViewStop = { itemId: string; place: ViewPlace; start: string; end: string; rideKm: number }
export type ViewDay = { index: number; date: string; startTime: string; light: boolean; stops: ViewStop[] }
export type ItineraryView = {
  days: ViewDay[]
  outbound?: Leg
  return?: Leg
  cost: CostBreakdown
  budget: ReturnType<typeof checkBudget>
}

/** Everything the itinerary screen shows, computed from stored data by plain code. */
export function buildItineraryView(i: ItineraryInput): ItineraryView {
  const tripDays = buildTripDays({
    startDate: i.startDate,
    days: i.days,
    outbound: i.outbound && { arriveTime: i.outbound.arriveTime, overnight: i.outbound.overnight },
  })
  const days = tripDays.map((d) => {
    const dayItems = i.items.filter((it) => it.dayIndex === d.index).sort((a, b) => a.position - b.position)
    const scheduled = scheduleDay(
      dayItems.map((it) => ({ placeId: it.itemId, durationMin: it.place.durationMin, lat: it.place.lat, lng: it.place.lng })),
      { startTime: d.startTime, transport: i.transport },
    )
    const stops = scheduled.map((s, k) => ({ itemId: dayItems[k].itemId, place: dayItems[k].place, start: s.start, end: s.end, rideKm: s.rideKm }))
    return { ...d, stops }
  })
  const allStops = days.flatMap((d) => d.stops)
  const cost = estimateTrip({
    party: i.party,
    nights: i.nights,
    roomPriceVnd: i.roomPriceVnd ?? DEFAULT_ROOM_PER_NIGHT,
    legs: [i.outbound, i.return].filter((l): l is Leg => Boolean(l)).map((l) => ({ priceVnd: l.priceVnd })),
    // Meals are covered by the daily food allowance, so food stops add only their ride.
    items: allStops.map((s) => ({ priceVnd: s.place.category === 'food' ? 0 : s.place.priceVnd, rideKm: s.rideKm })),
    transport: i.transport,
    foodPerPersonPerDayVnd: FOOD_PER_PERSON_PER_DAY,
    days: i.days,
  })
  return { days, outbound: i.outbound, return: i.return, cost, budget: checkBudget(i.budgetVnd, i.budgetScope, i.party, cost) }
}
