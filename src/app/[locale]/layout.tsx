import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Fraunces } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { TabBar } from '@/components/nav/TabBar'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { RegisterSW } from '@/components/pwa/RegisterSW'
import { routing } from '@/i18n/routing'
import 'lenis/dist/lenis.css'
import '../globals.css'

const body = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
})

const display = Fraunces({
  variable: '--font-display-face',
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
})

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  return { title: t('appName'), description: t('tagline') }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${body.variable} ${display.variable} font-sans antialiased pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-14 md:pb-0`}>
        <NextIntlClientProvider>
          {children}
          <TabBar />
        </NextIntlClientProvider>
        <RegisterSW />
        <SmoothScroll />
      </body>
    </html>
  )
}
