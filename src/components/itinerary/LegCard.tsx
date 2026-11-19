import { BusFront } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatVnd } from '@/lib/money'
import type { Leg } from '@/lib/itinerary/view'

/** `date` is the departure day, dd/MM. */
export function LegCard({ leg, kind, date }: { leg: Leg; kind: 'outbound' | 'return'; date?: string }) {
  const t = useTranslations('itinerary')
  const when = date ? (leg.overnight ? t('evening', { date }) : date) : undefined
  return (
    <section aria-label={t(kind)} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-ink" data-testid={`leg-${kind}`}>
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-soft text-sky-ink">
        <BusFront size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">
          {t(kind)}{when ? ` · ${when}` : ''}{leg.overnight ? ` · ${t('overnight')}` : ''}
        </p>
        <p className="mt-0.5 font-semibold break-words">{leg.operator}</p>
        <p className="mt-0.5 text-sm text-muted tabular-nums">
          {leg.departTime} → {leg.arriveTime} · {t('perPersonTotal', { amount: formatVnd(leg.priceVnd) })}
        </p>
      </div>
    </section>
  )
}
