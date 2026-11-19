'use client'

import { ArrowRight, BadgeCheck, TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { chatEstimate } from '@/lib/chat/estimate'
import { nextSaturday } from '@/lib/chat/nextSaturday'
import { missingFields, parseRequest, type Field, type TripRequest } from '@/lib/chat/parseRequest'
import { formatVnd } from '@/lib/money'
import { staggerIn } from '@/lib/motion'
import { durationLabel } from '@/lib/trip/schema'
import { createTrip } from '@/server/trips'

type Msg = { id: number; from: 'me' | 'bot'; text: string; field?: Field }
type Props = { signedIn: boolean; destinations: { id: string; name: string }[]; signIn: () => void; initialDestinationId?: string }

const QUICK: Record<Field, { label: string; text: string }[]> = {
  destination: [
    { label: 'Sa Pa', text: 'Sa Pa' },
    { label: 'Hà Giang', text: 'Hà Giang' },
    { label: 'Ninh Bình', text: 'Ninh Bình' },
    { label: 'Hạ Long', text: 'Hạ Long' },
  ],
  duration: [
    { label: 'Trong ngày', text: 'trong ngày' },
    { label: '2N1Đ', text: '2N1Đ' },
    { label: '3N2Đ', text: '3N2Đ' },
    { label: '4N3Đ', text: '4N3Đ' },
  ],
  party: [1, 2, 4, 6].map((n) => ({ label: `${n} người`, text: `${n} người` })),
  budget: [
    { label: '3 triệu', text: '3 triệu' },
    { label: '5 triệu', text: '5 triệu' },
    { label: '8 triệu', text: '8 triệu' },
    { label: '12 triệu', text: '12 triệu' },
  ],
  scope: [
    { label: 'Cả nhóm', text: 'cả nhóm' },
    { label: 'Mỗi người', text: 'mỗi người' },
  ],
  origin: [
    { label: 'Hà Nội', text: 'từ Hà Nội' },
    { label: 'TP.HCM', text: 'từ TP.HCM' },
    { label: 'Khác', text: 'khác' },
  ],
}

export function ChatPlanner({ signedIn, destinations, signIn, initialDestinationId }: Props) {
  const t = useTranslations('chat')
  const [req, setReq] = useState<TripRequest>(initialDestinationId ? { destinationId: initialDestinationId } : {})
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'bot', text: t('hello') }])
  const [draft, setDraft] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const listRef = useRef<HTMLOListElement>(null)
  const nextId = useRef(1)

  const missing = missingFields(req)
  const asking = missing[0]
  const complete = missing.length === 0 && req.destinationId
  const estimate = useMemo(
    () =>
      complete && req.days !== undefined && req.nights !== undefined && req.party && req.budgetVnd && req.budgetScope
        ? chatEstimate({ ...req, days: req.days, nights: req.nights, party: req.party, budgetVnd: req.budgetVnd, budgetScope: req.budgetScope })
        : null,
    [complete, req],
  )

  useEffect(() => {
    const last = listRef.current?.lastElementChild
    if (last) {
      staggerIn([last])
      last.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [msgs.length, estimate])

  const destName = (id?: string) => destinations.find((d) => d.id === id)?.name ?? id ?? ''

  const send = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    const parsed = parseRequest(clean)
    if (asking === 'origin' && /^kh[aá]c$/i.test(clean)) parsed.origin = 'other'
    const merged = { ...req, ...parsed }
    const add: Msg[] = [{ id: nextId.current++, from: 'me', text: clean }]
    const nextMissing = missingFields(merged)
    if (Object.keys(parsed).length === 0) add.push({ id: nextId.current++, from: 'bot', text: t('notUnderstood'), field: asking })
    else if (merged.unverifiedDestination && !merged.destinationId)
      add.push({ id: nextId.current++, from: 'bot', text: t('unverified', { name: merged.unverifiedDestination }), field: 'destination' })
    else if (nextMissing.length > 0) add.push({ id: nextId.current++, from: 'bot', text: t(`ask_${nextMissing[0]}`), field: nextMissing[0] })
    if (merged.unverifiedDestination && !merged.destinationId) delete merged.unverifiedDestination
    setReq(merged)
    setMsgs((m) => [...m, ...add])
    setDraft('')
  }

  const create = () => {
    if (!signedIn) return signIn()
    if (!req.destinationId || req.days === undefined || req.nights === undefined || !req.party || !req.budgetVnd || !req.budgetScope) return
    setError(undefined)
    startTransition(async () => {
      const res = await createTrip({
        destinationId: req.destinationId,
        startDate: nextSaturday(),
        days: req.days,
        nights: req.nights,
        party: req.party,
        budgetVnd: req.budgetVnd,
        budgetScope: req.budgetScope,
        transport: 'coach_grab',
      })
      if (res?.error) setError(t(`error_${res.error}`))
    })
  }

  const lastBot = [...msgs].reverse().find((m) => m.from === 'bot')
  const chip = 'min-h-10 rounded-full border border-jade px-4 text-sm font-medium text-jade hover:bg-jade-soft'

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col">
      <ol ref={listRef} className="flex-1 space-y-3" aria-live="polite">
        {msgs.map((m) => (
          <li key={m.id} className={m.from === 'me' ? 'flex justify-end' : 'flex'}>
            <div
              className={
                m.from === 'me'
                  ? 'max-w-[80%] rounded-[1.25rem] rounded-br-md bg-jade px-4 py-3 text-on-jade'
                  : 'max-w-[85%] rounded-[1.25rem] rounded-bl-md bg-surface px-4 py-3'
              }
            >
              <p className="leading-relaxed">{m.text}</p>
              {m === lastBot && m.field && !complete && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK[m.field].map((q) => (
                    <button key={q.label} type="button" className={chip} onClick={() => send(q.text)}>
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}

        {estimate && req.destinationId && (
          <li>
            <section className="rounded-[1.25rem] border border-line bg-surface p-4 text-ink" data-testid="chat-estimate">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <p className="text-lg font-bold tabular-nums">{t('perPerson', { amount: formatVnd(estimate.perPerson) })}</p>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    estimate.budget.ok ? 'bg-jade-soft text-jade' : 'bg-amber-soft text-amber-ink'
                  }`}
                >
                  {estimate.budget.ok ? <BadgeCheck size={14} aria-hidden /> : <TriangleAlert size={14} aria-hidden />}
                  {estimate.budget.ok ? t('withinBudget') : t('overBudget', { amount: formatVnd(estimate.budget.shortfallVnd) })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {destName(req.destinationId)} {durationLabel(req.days ?? 1, req.nights ?? 0)} · {t('people', { n: req.party ?? 1 })}
              </p>
              <dl className="mt-3 space-y-2 border-b border-line pb-3 text-sm">
                {estimate.rows.map((r) => (
                  <div key={r.key} className="flex justify-between gap-3">
                    <dt className="text-muted">{t(`row_${r.key}`, { n: r.nights ?? 0 })}</dt>
                    <dd className="font-semibold tabular-nums">{formatVnd(r.perPerson)}</dd>
                  </div>
                ))}
              </dl>
              {estimate.coachUnknown && <p className="mt-2 text-xs text-muted">{t('coachUnknown')}</p>}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-semibold">{t('expected')}</span>
                <span className="text-lg font-bold text-jade tabular-nums">{t('groupTotal', { amount: formatVnd(estimate.total) })}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{t('estimateNote')}</p>
              {error && <p role="alert" className="mt-3 rounded-xl bg-amber-soft p-3 text-sm">{error}</p>}
              <button
                type="button"
                onClick={create}
                disabled={pending}
                className="mt-4 min-h-12 w-full rounded-2xl bg-jade px-4 font-semibold text-on-jade disabled:opacity-60"
              >
                {!signedIn ? t('signInToCreate') : pending ? t('creating') : t('seeItinerary', { n: req.days ?? 1 })}
              </button>
            </section>
          </li>
        )}
      </ol>

      <form
        className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 flex gap-2 bg-bg py-2 md:bottom-0"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
      >
        <label htmlFor="chat-input" className="sr-only">{t('placeholder')}</label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('placeholder')}
          autoComplete="off"
          className="min-h-12 flex-1 rounded-full border border-line bg-surface px-5 placeholder:text-muted"
        />
        <button type="submit" aria-label={t('send')} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-jade text-on-jade">
          <ArrowRight size={20} aria-hidden />
        </button>
      </form>
    </div>
  )
}
