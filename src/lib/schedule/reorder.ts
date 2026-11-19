/** Returns a new array with the element at `from` moved to `to`. */
export function reorder<T>(items: readonly T[], from: number, to: number): T[] {
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < items.length
  if (!inRange(from) || !inRange(to)) throw new RangeError(`reorder: index out of range (${from} → ${to}, length ${items.length})`)
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
