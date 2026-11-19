import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { durationLabel } from '@/lib/trip/schema'

export const dynamic = 'force-dynamic'

export default async function TripPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const t = await getTranslations('itinerary')
  const supabase = await createSupabaseServer()
  const { data: trip } = await supabase
    .from('trips')
    .select('id, start_date, days, nights, party_size, destinations(name_vi, name_en), trip_items(id)')
    .eq('id', id)
    .maybeSingle()
  if (!trip) notFound()
  const dest = Array.isArray(trip.destinations) ? trip.destinations[0] : trip.destinations
  const name = locale === 'en' ? dest?.name_en : dest?.name_vi

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">
        {name} {durationLabel(trip.days, trip.nights)}
      </h1>
      {trip.trip_items.length === 0 && <p className="mt-4 rounded-xl bg-amber-soft p-3">{t('empty')}</p>}
    </main>
  )
}
