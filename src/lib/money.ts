const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })
const short = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

function assertVnd(amount: number): void {
  if (!Number.isInteger(amount)) throw new RangeError(`VND amount must be an integer, got ${amount}`)
}

/** 1950000 → "1.950.000đ" */
export function formatVnd(amount: number): string {
  assertVnd(amount)
  return `${vnd.format(amount)}đ`
}

/** 1950000 → "1,95tr", 650000 → "650k" */
export function shortVnd(amount: number): string {
  assertVnd(amount)
  if (Math.abs(amount) >= 1_000_000) return `${short.format(amount / 1_000_000)}tr`
  return `${short.format(amount / 1_000)}k`
}
