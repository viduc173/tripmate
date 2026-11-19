import { getTranslations, setRequestLocale } from 'next-intl/server'
import { StaggerList } from '@/components/motion/StaggerList'
import { Link } from '@/i18n/navigation'
import { createClient } from '@supabase/supabase-js'
import seed from '../../../data/seed/destinations.json'

export const revalidate = 3600

type Dest = { id: string; name_vi: string; name_en: string; province_vi: string; province_en: string }

async function loadDestinations(): Promise<Dest[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  // The bundled seed is the fallback, so Explore still renders if Supabase is unreachable.
  const fallback = seed.filter((d) => d.verified)
  if (!url || !key) return fallback
  try {
    const { data } = await createClient(url, key, { auth: { persistSession: false } })
      .from('destinations')
      .select('id, name_vi, name_en, province_vi, province_en')
      .eq('verified', true)
      .order('id')
    return data && data.length > 0 ? data : fallback
  } catch {
    return fallback
  }
}

export default async function Explore({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('explore')
  const en = locale === 'en'
  const destinations = await loadDestinations()
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-3xl bg-night px-5 py-8 text-white">
        <h1 className="text-3xl font-extrabold">{t('title')}</h1>
        <p className="mt-2 text-white/80">{t('subtitle')}</p>
        <Link href="/demo" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold text-night">
          {t('sample')}
        </Link>
      </section>
      <StaggerList className="mt-6 grid gap-3 sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.id} className="rounded-2xl bg-white p-4">
            <p className="text-lg font-bold break-words">{en ? d.name_en : d.name_vi}</p>
            <p className="text-sm break-words text-night/70">{en ? d.province_en : d.province_vi}</p>
            <Link href="/plan" className="mt-3 inline-flex min-h-11 items-center font-semibold text-jade">
              {t('planThis')} →
            </Link>
          </li>
        ))}
      </StaggerList>
    </main>
  )
}
