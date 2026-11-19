import 'server-only'
import type { ItineraryInput, Leg, ViewPlace } from '@/lib/itinerary/view'
import { createSupabaseServer } from '@/lib/supabase/server'
import { durationLabel } from '@/lib/trip/schema'

type Route = { operator: string; depart_time: string; arrive_time: string; overnight: boolean; price_vnd: number } | null
type PlaceRow = {
  id: string; name_vi: string; name_en: string; category: ViewPlace['category']
  duration_min: number; price_vnd: number; lat: number; lng: number
}

const one = <T,>(x: T | T[] | null): T | null => (Array.isArray(x) ? (x[0] ?? null) : x)
const hhmm = (t: string) => t.slice(0, 5)
const toLeg = (r: Route): Leg | undefined =>
  r ? { operator: r.operator, departTime: hhmm(r.depart_time), arriveTime: hhmm(r.arrive_time), overnight: r.overnight, priceVnd: r.price_vnd } : undefined

export async function loadTrip(id: string, locale: string): Promise<{ title: string; input: ItineraryInput } | null> {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('trips')
    .select(`
      id, start_date, days, nights, party_size, budget_vnd, budget_scope, transport,
      destinations(name_vi, name_en),
      outbound:bus_routes!trips_outbound_route_id_fkey(operator, depart_time, arrive_time, overnight, price_vnd),
      return_leg:bus_routes!trips_return_route_id_fkey(operator, depart_time, arrive_time, overnight, price_vnd),
      trip_items(id, day_index, position, places(id, name_vi, name_en, category, duration_min, price_vnd, lat, lng))
    `)
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  const en = locale === 'en'
  const dest = one(data.destinations as unknown as { name_vi: string; name_en: string } | null)
  const items = (data.trip_items ?? []).flatMap((it) => {
    const p = one(it.places as unknown as PlaceRow | null)
    if (!p) return []
    const place: ViewPlace = {
      id: p.id, name: en ? p.name_en : p.name_vi, category: p.category,
      durationMin: p.duration_min, priceVnd: p.price_vnd, lat: p.lat, lng: p.lng,
    }
    return [{ itemId: it.id, dayIndex: it.day_index, position: it.position, place }]
  })

  return {
    title: `${(en ? dest?.name_en : dest?.name_vi) ?? ''} ${durationLabel(data.days, data.nights)}`.trim(),
    input: {
      startDate: data.start_date,
      days: data.days,
      nights: data.nights,
      party: data.party_size,
      transport: data.transport as ItineraryInput['transport'],
      budgetVnd: data.budget_vnd,
      budgetScope: data.budget_scope as ItineraryInput['budgetScope'],
      outbound: toLeg(one(data.outbound as unknown as Route)),
      return: toLeg(one(data.return_leg as unknown as Route)),
      items,
    },
  }
}
