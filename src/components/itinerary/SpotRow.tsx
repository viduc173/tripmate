'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatVnd } from '@/lib/money'
import type { ViewStop } from '@/lib/itinerary/view'

type Props = { stop: ViewStop; first: boolean; last: boolean; onMove: (dir: -1 | 1) => void; onRemove?: () => void }

export function SpotRow({ stop, first, last, onMove, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: stop.itemId })
  const icon = 'grid size-11 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink disabled:opacity-25'
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 py-2.5 ${isDragging ? 'relative z-10 rounded-xl bg-surface shadow-lg' : ''}`}
      data-testid="spot"
      data-place={stop.place.id}
      data-flip-id={stop.itemId}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={`${icon} -ml-2 w-8 cursor-grab touch-none active:cursor-grabbing`}
        aria-label={t('drag', { name: stop.place.name })}
      >
        <GripVertical aria-hidden size={18} />
      </button>
      <time className="w-12 shrink-0 font-semibold text-jade tabular-nums" data-testid="spot-time">{stop.start}</time>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words text-ink">{stop.place.name}</p>
        <p className="text-sm text-muted">
          {stop.start}–{stop.end}
          {stop.rideKm > 0 && ` · ${t('ride', { km: stop.rideKm.toLocaleString('vi-VN') })}`}
          {' · '}
          {stop.place.priceVnd > 0 ? formatVnd(stop.place.priceVnd) : t('free')}
        </p>
      </div>
      <div className="flex shrink-0 flex-col">
        <button type="button" className={`${icon} h-8`} disabled={first} onClick={() => onMove(-1)} aria-label={`${t('moveUp')}: ${stop.place.name}`}>
          <ChevronUp aria-hidden size={18} />
        </button>
        <button type="button" className={`${icon} h-8`} disabled={last} onClick={() => onMove(1)} aria-label={`${t('moveDown')}: ${stop.place.name}`}>
          <ChevronDown aria-hidden size={18} />
        </button>
      </div>
      {onRemove && (
        <button type="button" className={`${icon} -mr-2`} onClick={onRemove} aria-label={`${t('remove')}: ${stop.place.name}`}>
          <X aria-hidden size={18} />
        </button>
      )}
    </li>
  )
}
