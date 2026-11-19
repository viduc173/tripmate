import { useTranslations } from 'next-intl'
import { formatVnd } from '@/lib/money'
import type { ViewStop } from '@/lib/itinerary/view'

type Props = { stop: ViewStop; first: boolean; last: boolean; onMove: (dir: -1 | 1) => void; onRemove?: () => void }

export function SpotRow({ stop, first, last, onMove, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const btn = 'min-h-11 min-w-11 rounded-lg border border-night/15 px-2 text-sm disabled:opacity-30'
  return (
    <li className="flex items-start gap-3 py-3" data-testid="spot" data-place={stop.place.id} data-flip-id={stop.itemId}>
      <time className="w-12 shrink-0 pt-0.5 font-semibold tabular-nums" data-testid="spot-time">{stop.start}</time>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">{stop.place.name}</p>
        <p className="text-sm text-night/70">
          {stop.start}–{stop.end}
          {stop.rideKm > 0 && ` · ${t('ride', { km: stop.rideKm.toLocaleString('vi-VN') })}`}
          {' · '}
          {stop.place.priceVnd > 0 ? formatVnd(stop.place.priceVnd) : t('free')}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" className={btn} disabled={first} onClick={() => onMove(-1)} aria-label={`${t('moveUp')}: ${stop.place.name}`}>↑</button>
        <button type="button" className={btn} disabled={last} onClick={() => onMove(1)} aria-label={`${t('moveDown')}: ${stop.place.name}`}>↓</button>
        {onRemove && (
          <button type="button" className={btn} onClick={onRemove} aria-label={`${t('remove')}: ${stop.place.name}`}>✕</button>
        )}
      </div>
    </li>
  )
}
