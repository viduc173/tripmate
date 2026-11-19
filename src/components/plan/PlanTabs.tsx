'use client'

import { MessageCircle, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

type Mode = 'chat' | 'form'

export function PlanTabs({ chat, form }: { chat: ReactNode; form: ReactNode }) {
  const t = useTranslations('plan')
  const [mode, setMode] = useState<Mode>('chat')
  const tabs: { id: Mode; label: string; Icon: typeof MessageCircle }[] = [
    { id: 'chat', label: t('chat'), Icon: MessageCircle },
    { id: 'form', label: t('form'), Icon: SlidersHorizontal },
  ]
  return (
    <>
      <div role="tablist" aria-label={t('title')} className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        {tabs.map(({ id, label, Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              role="tab"
              id={`plan-tab-${id}`}
              aria-selected={active}
              aria-controls={`plan-panel-${id}`}
              onClick={() => setMode(id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                active ? 'bg-jade text-on-jade' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon aria-hidden size={16} />
              {label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id="plan-panel-chat" aria-labelledby="plan-tab-chat" hidden={mode !== 'chat'}>{chat}</div>
      <div role="tabpanel" id="plan-panel-form" aria-labelledby="plan-tab-form" hidden={mode !== 'form'}>{form}</div>
    </>
  )
}
