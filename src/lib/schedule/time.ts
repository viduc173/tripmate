/** "HH:mm" ↔ minutes since midnight. Times never go through Date, so the browser time zone cannot shift them. */
export function toMinutes(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm)
  if (!m) throw new RangeError(`Expected HH:mm, got ${hhmm}`)
  return Number(m[1]) * 60 + Number(m[2])
}

export function toHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
