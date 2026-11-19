'use client'

import { Compass, Luggage, Sparkles, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

const TABS = [
  { href: '/', key: 'explore', Icon: Compass },
  { href: '/plan', key: 'plan', Icon: Sparkles },
  { href: '/trips', key: 'trips', Icon: Luggage },
  { href: '/me', key: 'me', Icon: UserRound },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/trips') return pathname.startsWith('/trips') || pathname === '/demo'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function TabBar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:top-0 md:bottom-auto md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around md:justify-end md:gap-1 md:px-6">
        <li className="mr-auto hidden items-center md:flex">
          <Link href="/" className="font-display text-2xl font-bold text-jade">TripMate</Link>
        </li>
        {TABS.map(({ href, key, Icon }) => {
          const active = isActive(pathname, href)
          const plan = key === 'plan'
          return (
            <li key={key} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 px-2 text-xs md:min-h-14 md:flex-row md:gap-2 md:px-3 md:text-sm ${
                  active ? 'font-semibold text-jade' : 'text-muted'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-7 items-center justify-center rounded-full transition-colors ${
                    plan ? (active ? 'w-12 bg-jade text-on-jade' : 'w-12 bg-jade-soft text-jade') : 'w-8'
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
