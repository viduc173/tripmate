import { describe, expect, it } from 'vitest'
import { scheduleDay, type Stop } from '@/lib/schedule/scheduleDay'
import { buildTripDays } from '@/lib/schedule/buildTripDays'

const KM_PER_DEG_LAT = 111.195
const at = (km: number) => ({ lat: 22.3 + km / KM_PER_DEG_LAT, lng: 103.84 })
const a: Stop = { placeId: 'a', durationMin: 60, ...at(0) }
const b: Stop = { placeId: 'b', durationMin: 150, ...at(3) }
const c: Stop = { placeId: 'c', durationMin: 60, ...at(5) }

describe('scheduleDay', () => {
  it('adds travel time rounded up to 5 minutes (coach + Grab, 25 km/h)', () => {
    const s = scheduleDay([a, b, c], { startTime: '08:00', transport: 'coach_grab' })
    expect(s.map((x) => x.start)).toEqual(['08:00', '09:10', '11:45'])
    expect(s.map((x) => x.end)).toEqual(['09:00', '11:40', '12:45'])
    expect(s.map((x) => x.rideKm)).toEqual([0, 3, 2])
  })
  it('reordering stops changes start times', () => {
    const s = scheduleDay([a, c, b], { startTime: '08:00', transport: 'coach_grab' })
    expect(s.map((x) => x.start)).toEqual(['08:00', '09:15', '10:20'])
  })
  it('motorbike is faster (35 km/h)', () => {
    const s = scheduleDay([a, b], { startTime: '08:00', transport: 'motorbike' })
    expect(s[1].start).toBe('09:10') // 3 km → 5.1 min → 10
  })
  it('empty list gives empty schedule', () => {
    expect(scheduleDay([], { startTime: '08:00', transport: 'coach_grab' })).toEqual([])
  })
})

describe('buildTripDays', () => {
  it('overnight bus arriving 05:30 gives a light first day from 06:00', () => {
    expect(buildTripDays({ startDate: '2026-11-21', days: 3, outbound: { arriveTime: '05:30', overnight: true } })).toEqual([
      { index: 0, date: '2026-11-21', startTime: '06:00', light: true },
      { index: 1, date: '2026-11-22', startTime: '08:00', light: false },
      { index: 2, date: '2026-11-23', startTime: '08:00', light: false },
    ])
  })
  it('daytime arrival or no outbound keeps 08:00', () => {
    expect(buildTripDays({ startDate: '2026-11-21', days: 1 })[0]).toEqual({ index: 0, date: '2026-11-21', startTime: '08:00', light: false })
    expect(buildTripDays({ startDate: '2026-11-21', days: 1, outbound: { arriveTime: '07:30', overnight: true } })[0].light).toBe(false)
  })
  it('crosses month and year boundaries without time zone drift', () => {
    expect(buildTripDays({ startDate: '2026-12-31', days: 2 }).map((d) => d.date)).toEqual(['2026-12-31', '2027-01-01'])
  })
})
