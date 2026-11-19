'use client'

import { useTranslations } from 'next-intl'
import { DURATION_PRESETS } from '@/lib/trip/schema'

type Props = { days: number; nights: number; onChange: (v: { days: number; nights: number }) => void }

export function DurationPicker({ days, nights, onChange }: Props) {
  const t = useTranslations('trip')
  const isPreset = DURATION_PRESETS.some((p) => p.days === days && p.nights === nights)
  const chip = 'rounded-full border px-4 py-2 text-sm font-medium min-h-11'
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{t('duration')}</legend>
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((p) => {
          const active = p.days === days && p.nights === nights
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ days: p.days, nights: p.nights })}
              className={`${chip} ${active ? 'border-jade bg-jade text-on-jade' : 'border-line bg-surface'}`}
            >
              {p.label}
            </button>
          )
        })}
        <span className={`${chip} ${!isPreset ? 'border-jade' : 'border-transparent'} flex items-center gap-2 bg-surface`}>
          {t('custom')}
          <label className="sr-only" htmlFor="days">{t('days')}</label>
          <select
            id="days"
            value={days}
            onChange={(e) => {
              const d = Number(e.target.value)
              onChange({ days: d, nights: Math.min(nights, d) })
            }}
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}N</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="nights">{t('nights')}</label>
          <select id="nights" value={nights} onChange={(e) => onChange({ days, nights: Number(e.target.value) })}>
            {Array.from({ length: days + 1 }, (_, i) => i).filter((n) => n <= 13).map((n) => (
              <option key={n} value={n}>{n}Đ</option>
            ))}
          </select>
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{t('nightsHint')}</p>
    </fieldset>
  )
}
