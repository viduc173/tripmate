'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { buildItineraryView, type ItineraryInput } from '@/lib/itinerary/view'
import { reorder } from '@/lib/schedule/reorder'
import { CostSummary } from './CostSummary'
import { DayCard } from './DayCard'
import { LegCard } from './LegCard'

type Props = {
  cacheKey: string
  title: string
  initial: ItineraryInput
  /** Persists a day's new order; omitted on read-only/sample views. */
  onReorder?: (dayIndex: number, orderedItemIds: string[]) => Promise<{ ok: boolean }>
  onRemove?: (itemId: string) => Promise<{ ok: boolean }>
}

function saveCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or storage full: the page still works, it just will not open offline.
  }
}

export function ItineraryView({ cacheKey, title, initial, onReorder, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const [input, setInput] = useState(initial)
  const [error, setError] = useState(false)
  const [offline, setOffline] = useState(false)
  const [, startTransition] = useTransition()
  const view = useMemo(() => buildItineraryView(input), [input])

  useEffect(() => saveCache(cacheKey, { title, input }), [cacheKey, title, input])
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const move = (dayIndex: number, from: number, to: number) => {
    const ids = reorder(view.days[dayIndex].stops.map((s) => s.itemId), from, to)
    const previous = input
    setInput((cur) => ({
      ...cur,
      items: cur.items.map((it) => (it.dayIndex === dayIndex ? { ...it, position: ids.indexOf(it.itemId) } : it)),
    }))
    if (onReorder) {
      startTransition(async () => {
        const res = await onReorder(dayIndex, ids)
        if (!res.ok) {
          setInput(previous)
          setError(true)
        }
      })
    }
  }

  const remove = onRemove
    ? (itemId: string) => {
        const previous = input
        setInput((cur) => ({ ...cur, items: cur.items.filter((it) => it.itemId !== itemId) }))
        startTransition(async () => {
          const res = await onRemove(itemId)
          if (!res.ok) {
            setInput(previous)
            setError(true)
          }
        })
      }
    : undefined

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold break-words" data-testid="trip-title">{title}</h1>
      {offline && <p className="rounded-xl bg-amber-soft p-3 text-sm">{t('offline')}</p>}
      {error && <p role="alert" className="rounded-xl bg-amber-soft p-3 text-sm">{t('saveError')}</p>}
      <CostSummary cost={view.cost} budget={view.budget} />
      {view.outbound && <LegCard leg={view.outbound} kind="outbound" />}
      {view.days.map((d) => (
        <DayCard key={d.index} day={d} onMove={(from, to) => move(d.index, from, to)} onRemove={remove} />
      ))}
      {view.return && <LegCard leg={view.return} kind="return" />}
    </div>
  )
}
