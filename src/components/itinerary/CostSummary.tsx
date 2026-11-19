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
    <section className="rounded-2xl border border-line bg-surface p-4 text-ink" data-testid="cost-summary">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-display text-2xl font-bold tabular-nums" data-testid="per-person">{t('perPersonTotal', { amount: formatVnd(cost.perPerson) })}</p>
        <p className="text-sm text-muted tabular-nums" data-testid="group-total">{t('groupTotal', { amount: formatVnd(cost.total) })}</p>
      </div>
      <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${budget.ok ? 'bg-jade-soft text-jade' : 'bg-amber-soft text-amber-ink'}`}>
        {budget.ok ? t('withinBudget') : t('overBudget', { amount: formatVnd(budget.shortfallVnd) })}
      </p>
      <details className="mt-3 text-sm">
        <summary className="min-h-11 cursor-pointer content-center font-semibold">{t('costDetail')}</summary>
        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{t(k)}</dt>
              <dd className="text-right tabular-nums">{formatVnd(v)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">{t('estimate')}</p>
      </details>
    </section>
  )
}
