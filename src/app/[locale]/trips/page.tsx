import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { durationLabel } from '@/lib/trip/schema'

export const dynamic = 'force-dynamic'

export default async function TripsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('trips')
  const supabase = await createSupabaseServer()
  const { data: claims } = await supabase.auth.getClaims()
  const signedIn = Boolean(claims?.claims.sub)
  const { data: trips } = signedIn
    ? await supabase.from('trips').select('id, start_date, days, nights, destinations(name_vi, name_en)').order('start_date')
    : { data: [] }
  const en = locale === 'en'
  return (
    <main className="mx-auto max-w-xl px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold text-ink">{t('title')}</h1>
      {!signedIn && <p className="mt-4 text-muted">{t('signIn')}</p>}
      {signedIn && (trips ?? []).length === 0 && <p className="mt-4 text-muted">{t('none')}</p>}
      <ul className="mt-4 space-y-3">
        {(trips ?? []).map((trip) => {
          const d = (Array.isArray(trip.destinations) ? trip.destinations[0] : trip.destinations) as { name_vi: string; name_en: string } | null
          return (
            <li key={trip.id}>
              <Link href={`/trips/${trip.id}`} className="block rounded-2xl border border-line bg-surface p-4 font-semibold text-ink hover:border-jade">
                {en ? d?.name_en : d?.name_vi} {durationLabel(trip.days, trip.nights)} · {trip.start_date.split('-').reverse().join('/')}
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
