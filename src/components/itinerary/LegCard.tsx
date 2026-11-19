import { useTranslations } from 'next-intl'
import { formatVnd } from '@/lib/money'
import type { Leg } from '@/lib/itinerary/view'

export function LegCard({ leg, kind }: { leg: Leg; kind: 'outbound' | 'return' }) {
  const t = useTranslations('itinerary')
  return (
    <section aria-label={t(kind)} className="rounded-2xl border border-night/10 bg-white p-4" data-testid={`leg-${kind}`}>
      <p className="text-sm font-semibold text-jade">{t(kind)}{leg.overnight ? ` · ${t('overnight')}` : ''}</p>
      <p className="mt-1 font-medium">{leg.operator}</p>
      <p className="mt-1 text-sm">
        {leg.departTime} → {leg.arriveTime} · {t('perPersonTotal', { amount: formatVnd(leg.priceVnd) })}
      </p>
    </section>
  )
}
