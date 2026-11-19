import {
  GRAB_4_SEAT_PER_KM,
  GRAB_7_SEAT_PER_KM,
  MOTORBIKE_FUEL_PER_KM,
  PEOPLE_PER_BIKE,
  PEOPLE_PER_ROOM,
} from './rates'

export type Transport = 'motorbike' | 'coach_grab'

export type CostInput = {
  party: number
  /** Nights at the destination; a night on an overnight bus is not counted. */
  nights: number
  roomPriceVnd: number
  /** Outbound/return legs, price per person. */
  legs: { priceVnd: number }[]
  /** Itinerary stops: ticket per person and ride distance to reach the stop. */
  items: { priceVnd: number; rideKm: number }[]
  transport: Transport
  foodPerPersonPerDayVnd: number
  days: number
}

export type CostBreakdown = {
  lodging: number
  legs: number
  tickets: number
  rides: number
  food: number
  total: number
  perPerson: number
}

export function roomsFor(party: number): number {
  return Math.ceil(party / PEOPLE_PER_ROOM)
}

export function carsFor(party: number): { seats: 4 | 7; count: number } {
  if (party <= 4) return { seats: 4, count: 1 }
  return { seats: 7, count: Math.ceil(party / 7) }
}

function ridesCost(totalKm: number, party: number, transport: Transport): number {
  if (transport === 'motorbike') return Math.round(totalKm * MOTORBIKE_FUEL_PER_KM * Math.ceil(party / PEOPLE_PER_BIKE))
  const cars = carsFor(party)
  const rate = cars.seats === 4 ? GRAB_4_SEAT_PER_KM : GRAB_7_SEAT_PER_KM
  return Math.round(totalKm * rate * cars.count)
}

export function estimateTrip(i: CostInput): CostBreakdown {
  if (!Number.isInteger(i.party) || i.party < 1) throw new RangeError('party must be a positive integer')
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  const lodging = roomsFor(i.party) * i.nights * i.roomPriceVnd
  const legs = sum(i.legs.map((l) => l.priceVnd)) * i.party
  const tickets = sum(i.items.map((it) => it.priceVnd)) * i.party
  const rides = ridesCost(sum(i.items.map((it) => it.rideKm)), i.party, i.transport)
  const food = i.foodPerPersonPerDayVnd * i.party * i.days
  const total = lodging + legs + tickets + rides + food
  return { lodging, legs, tickets, rides, food, total, perPerson: Math.ceil(total / i.party) }
}
