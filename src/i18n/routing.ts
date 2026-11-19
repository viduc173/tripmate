import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  // Vietnamese is the default for everyone; English only via /en or the language switch.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
