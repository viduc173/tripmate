/**
 * Upsert curated seed data into Supabase.
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (never commit them).
 * Run: pnpm seed
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { BusRouteSeed, DestinationSeed, PlaceSeed } from '../src/lib/data/schema'

const root = join(import.meta.dirname, '../data/seed')
const read = (p: string): unknown => JSON.parse(readFileSync(join(root, p), 'utf8'))

export function loadSeed() {
  const destinations = DestinationSeed.array().parse(read('destinations.json'))
  const busRoutes = BusRouteSeed.array().parse(read('bus_routes.json'))
  const places = readdirSync(join(root, 'places'))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => PlaceSeed.array().parse(read(`places/${f}`)))
  return { destinations, busRoutes, places }
}

export async function seed(): Promise<void> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { destinations, busRoutes, places } = loadSeed()

  const steps = [
    ['destinations', db.from('destinations').upsert(destinations, { onConflict: 'id' })],
    ['places', db.from('places').upsert(places, { onConflict: 'google_place_id' })],
    ['bus_routes', db.from('bus_routes').upsert(busRoutes, { onConflict: 'operator,from_city,to_destination_id,depart_time' })],
  ] as const
  const counts = { destinations: destinations.length, places: places.length, bus_routes: busRoutes.length }
  for (const [table, query] of steps) {
    const { error } = await query
    if (error) throw new Error(`${table}: ${error.message}`)
    console.log(`${table}: ${counts[table]} rows`)
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  seed().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
}
