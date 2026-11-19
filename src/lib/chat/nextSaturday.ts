/** Next Saturday (or today if Saturday) as YYYY-MM-DD in Asia/Ho_Chi_Minh. */
export function nextSaturday(now = new Date()): string {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now)
  const [y, m, d] = today.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d))
  base.setUTCDate(base.getUTCDate() + ((6 - base.getUTCDay() + 7) % 7))
  return base.toISOString().slice(0, 10)
}
