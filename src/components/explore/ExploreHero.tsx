'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { OTHER_DESTINATIONS, type MapDestination, type Region } from '@/lib/map/geo'
import { VietnamOutline } from './VietnamOutline'

const VietnamMap3D = dynamic(() => import('@/components/map/VietnamMap3D').then((m) => m.VietnamMap3D), { ssr: false })

export function ExploreHero({ verified }: { verified: MapDestination[] }) {
  const t = useTranslations('explore')
  const router = useRouter()
  const [region, setRegion] = useState<Region>('bac')
  const [selected, setSelected] = useState<string | null>(verified[0]?.id ?? null)
  const [opened, setOpened] = useState(false)
  const [ready, setReady] = useState(false)
  const all = useMemo(() => [...verified, ...OTHER_DESTINATIONS], [verified])
  const onReady = useCallback(() => setReady(true), [])
  const current = opened ? all.find((d) => d.id === selected) : undefined
  const select = useCallback((id: string) => {
    setSelected(id)
    setOpened(true)
  }, [])

  return (
    <section className="relative isolate h-[19rem] overflow-hidden rounded-[1.75rem] bg-hero text-white sm:h-[22rem]">
      <VietnamOutline className={`absolute top-4 right-2 h-[85%] transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-90'}`} />
      <VietnamMap3D destinations={all} region={region} selectedId={selected} focusId={opened ? selected : null} onSelect={select} onReady={onReady} safeLeft={0.45} labels="selected" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-hero via-hero/60 to-transparent" />

      <div className="pointer-events-none absolute inset-0 flex flex-col p-5 sm:p-7">
        <h1 className="max-w-[9ch] font-display text-[1.75rem] leading-tight font-bold sm:text-4xl">{t('heroTitle')}</h1>
        <p className="mt-3 max-w-[20ch] text-sm leading-relaxed text-white/75">{t('heroHint')}</p>

        {current && (
          <div className="pointer-events-auto mt-4 max-w-[15rem] rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="font-semibold">{current.name}</p>
            <p className="mt-0.5 text-xs text-white/75">{current.verified ? t('verified') : t('unverified')}</p>
            <button
              type="button"
              onClick={() => router.push(`/plan?d=${current.id}`)}
              className="mt-2 min-h-10 rounded-full bg-white px-4 text-sm font-semibold text-[#0f1e1a]"
            >
              {t('planThis')}
            </button>
          </div>
        )}

        <div className="pointer-events-auto mt-auto flex gap-2" role="group" aria-label={t('regions')}>
          {(['bac', 'trung', 'nam'] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={region === r}
              onClick={() => {
                setRegion(r)
                setSelected(null)
                setOpened(false)
              }}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                region === r ? 'border-white bg-white text-[#0f1e1a]' : 'border-white/25 text-white'
              }`}
            >
              {t(`region_${r}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
