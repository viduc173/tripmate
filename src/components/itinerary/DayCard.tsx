import { useFormatter, useTranslations } from 'next-intl'
import type { ViewDay } from '@/lib/itinerary/view'
import { SpotRow } from './SpotRow'

type Props = { day: ViewDay; onMove: (from: number, to: number) => void; onRemove?: (itemId: string) => void }

export function DayCard({ day, onMove, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const format = useFormatter()
  const [y, m, d] = day.date.split('-').map(Number)
  // Noon UTC on the trip date, formatted in Asia/Ho_Chi_Minh, so every browser shows the same day.
  const date = format.dateTime(new Date(Date.UTC(y, m - 1, d, 12)), { weekday: 'short', day: '2-digit', month: '2-digit' })
  return (
    <section className="rounded-2xl bg-white p-4" data-testid="day">
      <h2 className="font-bold">
        {t('day', { n: day.index + 1 })} · <span data-testid="day-date">{date}</span>
      </h2>
      {day.light && <p className="mt-2 rounded-xl bg-amber-soft p-3 text-sm" data-testid="light-day">{t('lightDay')}</p>}
      <ol className="divide-y divide-night/10">
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
    </section>
  )
}
