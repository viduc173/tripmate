import { createClient } from '@supabase/supabase-js'
import seed from '../../../data/seed/destinations.json'
import { DEST_ORDER } from './meta'

export type DestRow = { id: string; name_vi: string; name_en: string; province_vi: string; province_en: string }

/** Verified destinations, falling back to the bundled seed so pages still render if Supabase is unreachable. */
export async function loadVerifiedDestinations(): Promise<DestRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const fallback: DestRow[] = seed.filter((d) => d.verified)
  let rows = fallback
  if (url && key) {
    try {
      const { data } = await createClient(url, key, { auth: { persistSession: false } })
        .from('destinations')
        .select('id, name_vi, name_en, province_vi, province_en')
        .eq('verified', true)
      if (data && data.length > 0) rows = data
    } catch {
      // keep fallback
    }
  }
  return [...rows].sort((a, b) => DEST_ORDER.indexOf(a.id) - DEST_ORDER.indexOf(b.id))
}
