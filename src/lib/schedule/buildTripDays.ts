import { toHHmm, toMinutes } from './time'

export type TripDay = { index: number; date: string; startTime: string; light: boolean }

const DEFAULT_START = '08:00'
const EARLY_ARRIVAL_BEFORE = '07:00'
const SETTLE_IN_MIN = 30

function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export function buildTripDays(t: {
  startDate: string
  days: number
  outbound?: { arriveTime: string; overnight: boolean }
}): TripDay[] {
  const early =
    t.outbound?.overnight === true && toMinutes(t.outbound.arriveTime) < toMinutes(EARLY_ARRIVAL_BEFORE)
  return Array.from({ length: t.days }, (_, index) => {
    const light = index === 0 && early
    const startTime = light ? toHHmm(toMinutes(t.outbound!.arriveTime) + SETTLE_IN_MIN) : DEFAULT_START
    return { index, date: addDays(t.startDate, index), startTime, light }
  })
}
