/** Sky looks for day cards. Pure data so it can be unit tested and used for the CSS fallback. */
export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night'
export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog'

export type SkyParams = {
  top: [number, number, number]
  bottom: [number, number, number]
  ridge: [number, number, number]
  cloud: number
  rain: number
  snow: number
  storm: number
  fog: number
}

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const TIME: Record<TimeOfDay, { top: string; bottom: string; ridge: string }> = {
  sunrise: { top: '#5a7fb0', bottom: '#f3b98a', ridge: '#2c4a45' },
  day: { top: '#3f86c4', bottom: '#b9dcef', ridge: '#2f5d4c' },
  sunset: { top: '#3b3f74', bottom: '#f08a5d', ridge: '#2a2c3d' },
  night: { top: '#070d1c', bottom: '#1c2c4a', ridge: '#0a1512' },
}

const WEATHER: Record<Weather, Pick<SkyParams, 'cloud' | 'rain' | 'snow' | 'storm' | 'fog'> & { dim: number }> = {
  clear: { cloud: 0.1, rain: 0, snow: 0, storm: 0, fog: 0, dim: 0 },
  cloudy: { cloud: 0.7, rain: 0, snow: 0, storm: 0, fog: 0.1, dim: 0.15 },
  rain: { cloud: 0.85, rain: 0.8, snow: 0, storm: 0, fog: 0.2, dim: 0.3 },
  storm: { cloud: 1, rain: 1, snow: 0, storm: 1, fog: 0.15, dim: 0.5 },
  snow: { cloud: 0.6, rain: 0, snow: 0.9, storm: 0, fog: 0.3, dim: 0.05 },
  fog: { cloud: 0.3, rain: 0, snow: 0, storm: 0, fog: 0.85, dim: 0.1 },
}

const GREY: [number, number, number] = [0.55, 0.6, 0.64]
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

export function skyParams(time: TimeOfDay, weather: Weather): SkyParams {
  const t = TIME[time]
  const w = WEATHER[weather]
  return {
    top: mix(rgb(t.top), GREY, w.dim),
    bottom: mix(rgb(t.bottom), GREY, w.dim),
    ridge: rgb(t.ridge),
    cloud: w.cloud,
    rain: w.rain,
    snow: w.snow,
    storm: w.storm,
    fog: w.fog,
  }
}

/** CSS gradient with the same colours, shown before WebGL draws and when it is unavailable. */
export function skyFallback(p: SkyParams): string {
  const c = (v: [number, number, number]) => `rgb(${v.map((x) => Math.round(x * 255)).join(' ')})`
  return `linear-gradient(180deg, ${c(p.top)} 0%, ${c(p.bottom)} 100%)`
}

/** Day 1 after an overnight bus starts at dawn; other days show daylight. */
export function timeForStart(start: string): TimeOfDay {
  return start < '07:00' ? 'sunrise' : 'day'
}
