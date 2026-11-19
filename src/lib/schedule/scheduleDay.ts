import { haversineKm } from '@/lib/geo'
import type { Transport } from '@/lib/cost/estimate'
import { toHHmm, toMinutes } from './time'

export type Stop = { placeId: string; durationMin: number; lat: number; lng: number }
export type ScheduledStop = Stop & { start: string; end: string; rideKm: number }

const SPEED_KMH: Record<Transport, number> = { coach_grab: 25, motorbike: 35 }

export function travelMinutes(km: number, transport: Transport): number {
  return Math.ceil(((km / SPEED_KMH[transport]) * 60) / 5) * 5
}

export function scheduleDay(stops: Stop[], opts: { startTime: string; transport: Transport }): ScheduledStop[] {
  let clock = toMinutes(opts.startTime)
  return stops.map((stop, i) => {
    const rideKm = i === 0 ? 0 : Math.round(haversineKm(stops[i - 1], stop) * 10) / 10
    clock += travelMinutes(rideKm, opts.transport)
    const start = clock
    clock += stop.durationMin
    return { ...stop, rideKm, start: toHHmm(start), end: toHHmm(clock) }
  })
}
