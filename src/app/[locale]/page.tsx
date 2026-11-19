import { BadgeCheck, MountainSnow, TriangleAlert } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ExploreHero } from '@/components/explore/ExploreHero'
import { AppHeader } from '@/components/layout/AppHeader'
import { StaggerList } from '@/components/motion/StaggerList'
import { Link } from '@/i18n/navigation'
import { loadVerifiedDestinations } from '@/lib/destinations/load'
import { DEST_META } from '@/lib/destinations/meta'
import type { MapDestination } from '@/lib/map/geo'

export const revalidate = 3600

export default async function Explore({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('explore')
  const en = locale === 'en'
  const rows = await loadVerifiedDestinations()
  const mapDests: MapDestination[] = rows.flatMap((d) => {
    const m = DEST_META[d.id]
    return m ? [{ id: d.id, name: en ? d.name_en : d.name_vi, lon: m.lon, lat: m.lat, verified: true, region: 'bac' as const }] : []
  })

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 pt-4 pb-8 md:pt-8">
      <AppHeader />
      <ExploreHero verified={mapDests} />

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">{t('verifiedTitle')}</h2>
          <Link href="/plan" className="text-sm font-semibold text-jade">{t('seeAll')}</Link>
        </div>
        <StaggerList className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
          {rows.map((d) => {
            const m = DEST_META[d.id]
            const name = en ? d.name_en : d.name_vi
            return (
              <li key={d.id} className="w-[11.5rem] shrink-0 snap-start overflow-hidden rounded-[1.25rem] bg-surface md:w-auto">
                <Link href={`/plan?d=${d.id}`} className="block">
                  <div className={`flex h-24 items-end justify-between p-3.5 text-white ${m?.tone ?? 'bg-jade'}`}>
                    <span className="font-display text-xl leading-tight font-bold break-words">{name.split(' (')[0]}</span>
                    <MountainSnow size={22} strokeWidth={1.5} className="shrink-0 opacity-70" aria-hidden />
                  </div>
                  <div className="space-y-2 p-3.5">
                    <p className="text-xs leading-snug text-muted">
                      {en ? d.province_en : d.province_vi}
                      {m && ` · ${en ? m.travel_en : m.travel_vi}`}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-jade-soft px-2 py-0.5 text-[0.7rem] font-semibold text-jade">
                      <BadgeCheck size={12} aria-hidden />
                      {t('verified')}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </StaggerList>
      </section>

      <section className="flex gap-3 rounded-[1.25rem] bg-amber-soft p-4" aria-labelledby="season-tip">
        <TriangleAlert size={22} className="mt-0.5 shrink-0 text-amber-ink" aria-hidden />
        <div>
          <h2 id="season-tip" className="font-semibold text-amber-ink">{t('seasonTitle')}</h2>
          <p className="mt-1 text-sm leading-relaxed">{t('seasonBody')}</p>
        </div>
      </section>
    </main>
  )
}
