import { getTranslations, setRequestLocale } from 'next-intl/server'
import { TripForm } from '@/components/trip/TripForm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { signInWithGoogle } from '@/server/auth'

export const dynamic = 'force-dynamic'

export default async function PlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('trip')
  const supabase = await createSupabaseServer()
  const [{ data: claims }, { data: rows }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from('destinations').select('id, name_vi, name_en, province_vi, province_en').eq('verified', true).order('id'),
  ])
  const en = locale === 'en'
  const destinations = (rows ?? []).map((d) => ({
    id: d.id,
    name: en ? d.name_en : d.name_vi,
    province: en ? d.province_en : d.province_vi,
  }))
  const signedIn = Boolean(claims?.claims.sub)
  const next = en ? '/en/plan' : '/plan'

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      {signedIn ? (
        <TripForm destinations={destinations} />
      ) : (
        <form action={signInWithGoogle.bind(null, next)} className="rounded-2xl bg-white p-6">
          <p className="mb-4">{t('signInToSave')}</p>
          <button className="min-h-12 w-full rounded-xl bg-jade px-4 py-3 font-semibold text-white">{t('signInGoogle')}</button>
        </form>
      )}
    </main>
  )
}
