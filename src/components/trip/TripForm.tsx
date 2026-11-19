'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { formatVnd } from '@/lib/money'
import type { TripInput } from '@/lib/trip/schema'
import { createTrip } from '@/server/trips'
import { DurationPicker } from './DurationPicker'

type Destination = { id: string; name: string; province: string }

function todayInVietnam(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
}

export function TripForm({ destinations, initialDestinationId }: { destinations: Destination[]; initialDestinationId?: string }) {
  const t = useTranslations('trip')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const [form, setForm] = useState<TripInput>({
    destinationId: destinations.find((d) => d.id === initialDestinationId)?.id ?? destinations[0]?.id ?? '',
    startDate: todayInVietnam(),
    days: 3,
    nights: 2,
    party: 2,
    budgetVnd: 5_000_000,
    budgetScope: 'group',
    transport: 'coach_grab',
  })
  const set = (patch: Partial<TripInput>) => setForm((f) => ({ ...f, ...patch }))
  const field = 'mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3'
  const errors = { invalid: t('errorInvalid'), auth: t('errorAuth'), save: t('errorSave') } as const

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        setError(undefined)
        startTransition(async () => {
          const res = await createTrip(form)
          if (res?.error) setError(errors[res.error])
        })
      }}
    >
      <label className="block">
        <span className="font-semibold">{t('destination')}</span>
        <select className={field} value={form.destinationId} onChange={(e) => set({ destinationId: e.target.value })}>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>{d.name} · {d.province}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-semibold">{t('startDate')}</span>
        <input type="date" className={field} value={form.startDate} min={todayInVietnam()} onChange={(e) => set({ startDate: e.target.value })} />
      </label>

      <DurationPicker days={form.days} nights={form.nights} onChange={set} />

      <label className="block">
        <span className="font-semibold">{t('partySize')}</span>
        <input type="number" inputMode="numeric" min={1} max={20} className={field} value={form.party} onChange={(e) => set({ party: Number(e.target.value) })} />
      </label>

      <fieldset>
        <legend className="font-semibold">{t('budget')}</legend>
        <input
          aria-label={t('budget')}
          inputMode="numeric"
          className={field}
          value={formatVnd(form.budgetVnd)}
          onChange={(e) => set({ budgetVnd: Number(e.target.value.replace(/\D/g, '') || 0) })}
        />
        <div className="mt-2 flex gap-4">
          {(['group', 'person'] as const).map((s) => (
            <label key={s} className="flex min-h-11 items-center gap-2">
              <input type="radio" name="scope" checked={form.budgetScope === s} onChange={() => set({ budgetScope: s })} />
              {s === 'group' ? t('scopeGroup') : t('scopePerson')}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">{t('transport')}</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {(['coach_grab', 'motorbike'] as const).map((m) => (
            <label key={m} className="flex min-h-11 items-center gap-2">
              <input type="radio" name="transport" checked={form.transport === m} onChange={() => set({ transport: m })} />
              {m === 'coach_grab' ? t('coachGrab') : t('motorbike')}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p role="alert" className="rounded-xl bg-amber-soft p-3">{error}</p>}

      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-jade px-4 py-3 font-semibold text-on-jade disabled:opacity-60">
        {pending ? t('saving') : t('create')}
      </button>
    </form>
  )
}
