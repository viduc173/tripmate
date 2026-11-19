import { checkBudget } from '@/lib/cost/budget'
import { estimateTrip } from '@/lib/cost/estimate'
import {
  COACH_FARE_FROM_HANOI,
  DEFAULT_ROOM_PER_NIGHT,
  FOOD_PER_PERSON_PER_DAY,
  RIDE_KM_PER_DAY,
  TICKETS_PER_PERSON_PER_DAY,
} from '@/lib/cost/rates'
import type { TripRequest } from './parseRequest'

export type EstimateRow = { key: 'coach' | 'stay' | 'daily'; perPerson: number; nights?: number }

type Complete = Required<Pick<TripRequest, 'days' | 'nights' | 'party' | 'budgetVnd' | 'budgetScope'>> & TripRequest

/** First budget check in the chat, before any place is picked: every figure is an estimate from rates.ts. */
export function chatEstimate(r: Complete) {
  const fare = r.origin === 'ha-noi' && r.destinationId ? (COACH_FARE_FROM_HANOI[r.destinationId] ?? 0) : 0
  const coachUnknown = r.origin !== 'ha-noi'
  const days = r.days
  const b = estimateTrip({
    party: r.party,
    nights: r.nights,
    roomPriceVnd: DEFAULT_ROOM_PER_NIGHT,
    legs: fare > 0 ? [{ priceVnd: fare }, { priceVnd: fare }] : [],
    items: Array.from({ length: days }, () => ({ priceVnd: TICKETS_PER_PERSON_PER_DAY, rideKm: RIDE_KM_PER_DAY })),
    transport: 'coach_grab',
    foodPerPersonPerDayVnd: FOOD_PER_PERSON_PER_DAY,
    days,
  })
  const per = (v: number) => Math.ceil(v / r.party)
  const rows: EstimateRow[] = []
  if (b.legs > 0) rows.push({ key: 'coach', perPerson: per(b.legs) })
  if (b.lodging > 0) rows.push({ key: 'stay', perPerson: per(b.lodging), nights: r.nights })
  rows.push({ key: 'daily', perPerson: per(b.food + b.tickets + b.rides) })
  return { rows, perPerson: b.perPerson, total: b.total, budget: checkBudget(r.budgetVnd, r.budgetScope, r.party, b), coachUnknown }
}
