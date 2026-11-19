import { useTranslations } from 'next-intl'
import { formatVnd } from '@/lib/money'
import type { ItineraryView } from '@/lib/itinerary/view'

export function CostSummary({ cost, budget }: Pick<ItineraryView, 'cost' | 'budget'>) {
  const t = useTranslations('itinerary')
  const rows = [
    ['lodging', cost.lodging],
    ['legs', cost.legs],
    ['tickets', cost.tickets],
    ['rides', cost.rides],
    ['food', cost.food],
  ] as const
  return (
    <section className="rounded-2xl bg-night p-4 text-white" data-testid="cost-summary">
      <p className="text-2xl font-bold" data-testid="per-person">{t('perPersonTotal', { amount: formatVnd(cost.perPerson) })}</p>
      <p className="mt-1" data-testid="group-total">{t('groupTotal', { amount: formatVnd(cost.total) })}</p>
      <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm ${budget.ok ? 'bg-jade' : 'bg-amber-soft text-night'}`}>
        {budget.ok ? t('withinBudget') : t('overBudget', { amount: formatVnd(budget.shortfallVnd) })}
      </p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer">{t('estimate')}</summary>
        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt>{t(k)}</dt>
              <dd className="text-right tabular-nums">{formatVnd(v)}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}
