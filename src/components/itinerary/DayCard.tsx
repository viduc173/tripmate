'use client'

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'
import type { ViewDay } from '@/lib/itinerary/view'
import { SpotRow } from './SpotRow'

type Props = {
  day: ViewDay
  onMove: (from: number, to: number, opts?: { drag?: boolean }) => void
  onRemove?: (itemId: string) => void
}

export function DayCard({ day, onMove, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const format = useFormatter()
  const [askedAdd, setAskedAdd] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [y, m, d] = day.date.split('-').map(Number)
  // Noon UTC on the trip date, formatted in Asia/Ho_Chi_Minh, so every browser shows the same day.
  const date = format.dateTime(new Date(Date.UTC(y, m - 1, d, 12)), { weekday: 'short', day: '2-digit', month: '2-digit' })
  const ids = day.stops.map((s) => s.itemId)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)), { drag: true })
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 text-ink" data-testid="day">
      <h2 className="font-display text-xl font-bold">
        {t('day', { n: day.index + 1 })} <span className="text-muted">·</span> <span data-testid="day-date">{date}</span>
      </h2>
      {day.light && (
        <p className="mt-3 rounded-xl bg-amber-soft p-3 text-sm text-amber-ink" data-testid="light-day">{t('lightDay')}</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol className="mt-1 divide-y divide-line">
            {day.stops.map((s, i) => (
              <SpotRow
                key={s.itemId}
                stop={s}
                first={i === 0}
                last={i === day.stops.length - 1}
                onMove={(dir) => onMove(i, i + dir)}
                onRemove={onRemove && (() => onRemove(s.itemId))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => setAskedAdd(true)}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-semibold text-jade hover:border-jade"
      >
        <Plus aria-hidden size={16} /> {t('addSuggested')}
      </button>
      {askedAdd && <p role="status" className="mt-2 text-sm text-muted">{t('addSoon')}</p>}
    </section>
  )
}
