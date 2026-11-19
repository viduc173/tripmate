'use client'

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Cloud, CloudFog, CloudLightning, CloudRain, Plus, Snowflake, Sun } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'
import type { ViewDay } from '@/lib/itinerary/view'
import { skyFallback, skyParams, timeForStart, type Weather } from '@/lib/sky/presets'
import { Backdrop } from '@/components/backdrop/Backdrop'
import { SpotRow } from './SpotRow'

const WEATHER_ICON: Record<Weather, typeof Sun> = { clear: Sun, cloudy: Cloud, rain: CloudRain, storm: CloudLightning, snow: Snowflake, fog: CloudFog }

type Props = {
  day: ViewDay
  onMove: (from: number, to: number, opts?: { drag?: boolean }) => void
  onRemove?: (itemId: string) => void
}

export function DayCard({ day, onMove, onRemove }: Props) {
  const t = useTranslations('itinerary')
  const format = useFormatter()
  const [askedAdd, setAskedAdd] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [y, m, d] = day.date.split('-').map(Number)
  // Noon UTC on the trip date, formatted in Asia/Ho_Chi_Minh, so every browser shows the same day.
  const date = format.dateTime(new Date(Date.UTC(y, m - 1, d, 12)), { weekday: 'short', day: '2-digit', month: '2-digit' })
  const ids = day.stops.map((s) => s.itemId)
  const sky = skyParams(timeForStart(day.startTime), day.weather ?? 'clear')
  const WeatherIcon = day.weather ? WEATHER_ICON[day.weather] : null
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)), { drag: true })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface text-ink" data-testid="day">
      <div className="relative isolate flex h-28 items-end p-4" data-testid="day-sky" data-weather={day.weather ?? 'none'}>
        <Backdrop
          program="sky"
          fallback={skyFallback(sky)}
          uniforms={{ uTop: sky.top, uBottom: sky.bottom, uRidge: sky.ridge, uCloud: sky.cloud, uRain: sky.rain, uSnow: sky.snow, uStorm: sky.storm, uFog: sky.fog, uSeed: day.index * 3.7 + 1 }}
          className="-z-10"
        />
        {/* Scrim keeps the white heading above 4.5:1 on every sky. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/10 via-45% to-transparent" />
        <h2 className="min-w-0 flex-1 font-display text-xl font-bold text-white">
          {t('day', { n: day.index + 1 })} <span className="text-white/70">·</span> <span data-testid="day-date">{date}</span>
        </h2>
        {WeatherIcon && day.weather && (
          <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <WeatherIcon aria-hidden size={14} /> {t(`weather_${day.weather}`)}
          </span>
        )}
      </div>
      <div className="p-4 pt-1">
      {day.light && (
        <p className="mt-3 rounded-xl bg-amber-soft p-3 text-sm text-amber-ink" data-testid="light-day">{t('lightDay')}</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol className="mt-1 divide-y divide-line">
            {day.stops.map((s, i) => (
              <SpotRow
                key={s.itemId}
                stop={s}
                first={i === 0}
                last={i === day.stops.length - 1}
                onMove={(dir) => onMove(i, i + dir)}
                onRemove={onRemove && (() => onRemove(s.itemId))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => setAskedAdd(true)}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-semibold text-jade hover:border-jade"
      >
        <Plus aria-hidden size={16} /> {t('addSuggested')}
      </button>
      {askedAdd && <p role="status" className="mt-2 text-sm text-muted">{t('addSoon')}</p>}
      </div>
    </section>
  )
}
