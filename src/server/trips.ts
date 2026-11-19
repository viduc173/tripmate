'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { planInitialItems } from '@/lib/trip/initialItems'
import { TripInput } from '@/lib/trip/schema'

export type CreateTripState = { error?: 'invalid' | 'auth' | 'save' }

export async function createTrip(input: unknown): Promise<CreateTripState> {
  const parsed = TripInput.safeParse(input)
  if (!parsed.success) return { error: 'invalid' }
  const t = parsed.data

  const supabase = await createSupabaseServer()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return { error: 'auth' }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      destination_id: t.destinationId,
      start_date: t.startDate,
      days: t.days,
      nights: t.nights,
      party_size: t.party,
      budget_vnd: t.budgetVnd,
      budget_scope: t.budgetScope,
      transport: t.transport,
      outbound_route_id: t.outboundRouteId ?? null,
      return_route_id: t.returnRouteId ?? null,
    })
    .select('id')
    .single()
  if (error || !trip) return { error: 'save' }

  const { data: places } = await supabase
    .from('places')
    .select('id, category')
    .eq('destination_id', t.destinationId)
    .order('price_verified_at', { ascending: false, nullsFirst: false })
  const items = planInitialItems(places ?? [], t.days).map((i) => ({ ...i, trip_id: trip.id }))
  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('trip_items').insert(items)
    if (itemsError) return { error: 'save' }
  }

  redirect(`/trips/${trip.id}`)
}
