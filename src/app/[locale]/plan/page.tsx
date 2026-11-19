import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChatPlanner } from '@/components/plan/ChatPlanner'
import { PlanTabs } from '@/components/plan/PlanTabs'
import { TripForm } from '@/components/trip/TripForm'
import { loadVerifiedDestinations } from '@/lib/destinations/load'
import { createSupabaseServer } from '@/lib/supabase/server'
import { signInWithGoogle } from '@/server/auth'

export const dynamic = 'force-dynamic'

async function isSignedIn(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServer()
    const { data } = await supabase.auth.getClaims()
    return Boolean(data?.claims.sub)
  } catch {
    return false
  }
}

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ d?: string }>
}) {
  const [{ locale }, { d }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)
  const [t, tt, rows, signedIn] = await Promise.all([
    getTranslations('plan'),
    getTranslations('trip'),
    loadVerifiedDestinations(),
    isSignedIn(),
  ])
  const en = locale === 'en'
  const destinations = rows.map((r) => ({
    id: r.id,
    name: en ? r.name_en : r.name_vi,
    province: en ? r.province_en : r.province_vi,
  }))
  const initial = destinations.some((x) => x.id === d) ? d : undefined
  const signIn = signInWithGoogle.bind(null, en ? '/en/plan' : '/plan')

  return (
    <main className="mx-auto flex max-w-xl flex-col px-4 pt-6 pb-4">
      <h1 className="mb-4 font-display text-3xl font-bold text-ink">{t('title')}</h1>
      <PlanTabs
        chat={<ChatPlanner signedIn={signedIn} destinations={destinations} signIn={signIn} initialDestinationId={initial} />}
        form={
          signedIn ? (
            <TripForm destinations={destinations} initialDestinationId={initial} />
          ) : (
            <form action={signIn} className="rounded-2xl border border-line bg-surface p-6">
              <p className="mb-4 text-ink">{tt('signInToSave')}</p>
              <button className="min-h-12 w-full rounded-xl bg-jade px-4 py-3 font-semibold text-on-jade">{tt('signInGoogle')}</button>
            </form>
          )
        }
      />
    </main>
  )
}
