import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ItineraryView } from '@/components/itinerary/ItineraryView'
import { loadTrip } from '@/server/loadTrip'
import { removeItem, reorderItems } from '@/server/trips'

export const dynamic = 'force-dynamic'

export default async function TripPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const t = await getTranslations('itinerary')
  const trip = await loadTrip(id, locale)
  if (!trip) notFound()

  return (
    <main className="mx-auto max-w-xl px-4 pt-4 pb-8">
      {trip.input.items.length === 0 && <p className="mb-4 rounded-xl bg-amber-soft p-3">{t('empty')}</p>}
      <ItineraryView
        cacheKey={`trip:${id}`}
        title={trip.title}
        initial={trip.input}
        onReorder={reorderItems.bind(null, id)}
        onRemove={removeItem.bind(null, id)}
      />
    </main>
  )
}
