import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ThemeSwitch } from '@/components/theme/ThemeSwitch'
import { Link } from '@/i18n/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { signOut } from '@/server/auth'

export const dynamic = 'force-dynamic'

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('me')
  const c = await getTranslations('common')
  const supabase = await createSupabaseServer()
  const { data } = await supabase.auth.getClaims()
  const email = data?.claims.email as string | undefined
  const chip = 'inline-flex min-h-11 items-center rounded-full border px-4'
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-ink">{t('title')}</h1>
      <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
        <h2 className="font-semibold">{c('language')}</h2>
        <div className="mt-3 flex gap-2">
          <Link href="/me" locale="vi" className={`${chip} ${locale === 'vi' ? 'border-jade text-jade' : 'border-line'}`}>Tiếng Việt</Link>
          <Link href="/me" locale="en" className={`${chip} ${locale === 'en' ? 'border-jade text-jade' : 'border-line'}`}>English</Link>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
        <ThemeSwitch />
      </section>
      <section className="rounded-2xl border border-line bg-surface p-4 text-ink">
        {email ? (
          <>
            <p className="break-all">{t('signedInAs')}: {email}</p>
            <form action={signOut} className="mt-3">
              <button className={`${chip} border-line`}>{c('signOut')}</button>
            </form>
          </>
        ) : (
          <p>{t('notSignedIn')}</p>
        )}
      </section>
    </main>
  )
}
