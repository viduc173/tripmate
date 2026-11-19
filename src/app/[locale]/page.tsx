import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'
import { Link } from '@/i18n/navigation'

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  setRequestLocale(locale)
  const t = useTranslations('common')
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold text-jade">{t('appName')}</h1>
      <p className="mt-3">{t('tagline')}</p>
      <p className="mt-6 text-sm">
        {t('language')}:{' '}
        <Link href="/" locale="vi" className="underline">Tiếng Việt</Link>
        {' · '}
        <Link href="/" locale="en" className="underline">English</Link>
      </p>
    </main>
  )
}
