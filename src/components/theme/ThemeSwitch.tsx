'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type Choice = 'light' | 'dark' | 'system'

function apply(choice: Choice) {
  const dark = choice === 'dark' || (choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function ThemeSwitch() {
  const t = useTranslations('theme')
  const [choice, setChoice] = useState<Choice>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tm-theme') as Choice | null
      if (saved) setChoice(saved)
    } catch {
      // Storage blocked: stay on system.
    }
  }, [])

  useEffect(() => {
    apply(choice)
    if (choice !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => apply('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [choice])

  const pick = (c: Choice) => {
    setChoice(c)
    try {
      localStorage.setItem('tm-theme', c)
    } catch {
      // Not saved, but applied for this visit.
    }
  }

  const options = [
    { c: 'light' as const, Icon: Sun },
    { c: 'dark' as const, Icon: Moon },
    { c: 'system' as const, Icon: Monitor },
  ]
  return (
    <div role="radiogroup" aria-label={t('label')} className="grid grid-cols-3 gap-1 rounded-2xl bg-bg p-1">
      {options.map(({ c, Icon }) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={choice === c}
          onClick={() => pick(c)}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm ${
            choice === c ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-muted'
          }`}
        >
          <Icon size={16} aria-hidden />
          {t(c)}
        </button>
      ))}
    </div>
  )
}
