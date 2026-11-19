import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ItineraryView } from '@/components/itinerary/ItineraryView'
import { SAMPLE_SAPA } from '@/lib/itinerary/sample'

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('itinerary')
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <p className="rounded-xl border border-jade/30 bg-white p-3 text-sm">{t('sample')}</p>
      <ItineraryView cacheKey="trip:demo" title="Sa Pa 3N2Đ" initial={SAMPLE_SAPA} />
    </main>
  )
}
