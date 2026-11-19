'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

const TABS = [
  { href: '/', key: 'explore', icon: '◎' },
  { href: '/plan', key: 'plan', icon: '+' },
  { href: '/trips', key: 'trips', icon: '▤' },
  { href: '/me', key: 'me', icon: '○' },
] as const

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function TabBar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-night/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:top-0 md:bottom-auto md:border-t-0 md:border-b"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around md:justify-end md:gap-2 md:px-4">
        <li className="mr-auto hidden items-center font-extrabold text-jade md:flex">TripMate</li>
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href)
          const plan = tab.key === 'plan'
          return (
            <li key={tab.key} className="flex">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 min-w-16 flex-col items-center justify-center gap-0.5 px-3 text-xs font-medium md:min-h-12 md:flex-row md:gap-2 md:text-sm ${
                  active ? 'text-jade' : 'text-night/70'
                }`}
              >
                <span
                  aria-hidden
                  className={
                    plan
                      ? 'flex size-9 items-center justify-center rounded-full bg-jade text-lg text-white md:size-7 md:text-base'
                      : 'text-lg md:text-base'
                  }
                >
                  {tab.icon}
                </span>
                {t(tab.key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
