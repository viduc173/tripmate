import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'

/** Mobile header from the mockup: wordmark plus a VI · EN switch. Desktop uses the top tab bar. */
export function AppHeader({ path = '/' }: { path?: string }) {
  const locale = useLocale()
  return (
    <header className="flex items-center justify-between md:hidden">
      <Link href="/" className="font-display text-[1.75rem] font-bold text-jade">TripMate</Link>
      <Link
        href={path}
        locale={locale === 'vi' ? 'en' : 'vi'}
        className="flex min-h-10 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold tracking-wide"
        aria-label={locale === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      >
        <span className={locale === 'vi' ? 'text-ink' : 'text-muted'}>VI</span>
        <span className="px-1 text-muted">·</span>
        <span className={locale === 'en' ? 'text-ink' : 'text-muted'}>EN</span>
      </Link>
    </header>
  )
}
