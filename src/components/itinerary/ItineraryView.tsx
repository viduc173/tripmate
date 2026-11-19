'use client'

import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Link } from '@/i18n/navigation'
import { buildItineraryView, type ItineraryInput } from '@/lib/itinerary/view'
import { shortVnd } from '@/lib/money'
import { captureFlip, playFlip, type FlipState } from '@/lib/motion'
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

type Tab = 'plan' | 'moves' | 'checklist' | 'group'
const TABS: Tab[] = ['plan', 'moves', 'checklist', 'group']

/** dd/MM of an ISO date shifted by `offset` days. */
function ddmm(iso: string, offset = 0): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + offset))
  return `${String(dt.getUTCDate()).padStart(2, '0')}/${String(dt.getUTCMonth() + 1).padStart(2, '0')}`
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
  const [tab, setTab] = useState<Tab>('plan')
  const [, startTransition] = useTransition()
  const view = useMemo(() => buildItineraryView(input), [input])
  const rootRef = useRef<HTMLDivElement>(null)
  const flip = useRef<FlipState | null>(null)

  // Animate rows from their old position to the new one after a reorder or removal.
  useLayoutEffect(() => {
    playFlip(flip.current)
    flip.current = null
  }, [input])

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

  const move = (dayIndex: number, from: number, to: number, opts?: { drag?: boolean }) => {
    const ids = reorder(view.days[dayIndex].stops.map((s) => s.itemId), from, to)
    const previous = input
    // Dragging already animates the row; FLIP only for the button moves.
    flip.current = opts?.drag ? null : captureFlip(rootRef.current)
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
        flip.current = captureFlip(rootRef.current)
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

  const lastDay = view.days[view.days.length - 1]
  const outboundDate = view.outbound ? ddmm(input.startDate, view.outbound.overnight ? -1 : 0) : undefined
  const returnDate = lastDay ? ddmm(lastDay.date) : undefined
  const legs = (
    <>
      {view.outbound && <LegCard leg={view.outbound} kind="outbound" date={outboundDate} />}
      {view.return && tab === 'moves' && <LegCard leg={view.return} kind="return" date={returnDate} />}
    </>
  )

  return (
    <div ref={rootRef} className="space-y-4">
      <header className="space-y-2">
        <Link href="/trips" className="-ml-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-jade">
          <ChevronLeft aria-hidden size={18} /> {t('back')}
        </Link>
        <h1 className="font-display text-3xl leading-tight font-bold break-words text-ink" data-testid="trip-title">{title}</h1>
        <p className="text-sm text-muted">
          {ddmm(input.startDate)}–{returnDate ?? ddmm(input.startDate)} · {t('people', { n: input.party })} ·{' '}
          {input.transport === 'motorbike' ? t('motorbike') : t('coachGrab')}
        </p>
        <p className="inline-flex rounded-full bg-jade-soft px-3 py-1 text-sm font-semibold text-jade tabular-nums">
          {t('perPersonTotal', { amount: shortVnd(view.cost.perPerson) })} · {t('pillGroup', { amount: shortVnd(view.cost.total) })}
        </p>
      </header>

      <nav aria-label={t('sections')} className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div role="tablist" className="flex min-w-max gap-1 border-b border-line">
          {TABS.map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px min-h-11 border-b-2 px-3 text-sm font-semibold whitespace-nowrap ${
                tab === id ? 'border-jade text-jade' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t(`tab_${id}`)}
            </button>
          ))}
        </div>
      </nav>

      {offline && <p className="rounded-xl bg-amber-soft p-3 text-sm text-amber-ink">{t('offline')}</p>}
      {error && <p role="alert" className="rounded-xl bg-amber-soft p-3 text-sm text-amber-ink">{t('saveError')}</p>}

      {tab === 'plan' && (
        <>
          {legs}
          {view.days.map((d) => (
            <DayCard key={d.index} day={d} onMove={(from, to, o) => move(d.index, from, to, o)} onRemove={remove} />
          ))}
          {view.return && <LegCard leg={view.return} kind="return" date={returnDate} />}
          <CostSummary cost={view.cost} budget={view.budget} />
        </>
      )}
      {tab === 'moves' && legs}
      {(tab === 'checklist' || tab === 'group') && (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">{t('soon')}</p>
      )}
    </div>
  )
}
