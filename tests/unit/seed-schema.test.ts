import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BusRouteSeed, DestinationSeed, PlaceSeed } from '@/lib/data/schema'

const place = {
  destination_id: 'sapa',
  google_place_id: 'ChIJexample',
  category: 'sight',
  name_vi: 'Bản Cát Cát',
  name_en: 'Cat Cat Village',
  price_vnd: 150000,
  duration_min: 120,
  indoor: false,
  lat: 22.3296,
  lng: 103.8344,
}

describe('PlaceSeed', () => {
  it('accepts a valid row', () => {
    expect(PlaceSeed.safeParse(place).success).toBe(true)
  })
  it('rejects a row without google_place_id', () => {
    const rest: Partial<typeof place> = { ...place }
    delete rest.google_place_id
    expect(PlaceSeed.safeParse(rest).success).toBe(false)
  })
  it('rejects a negative price', () => {
    expect(PlaceSeed.safeParse({ ...place, price_vnd: -1 }).success).toBe(false)
  })
  it('rejects an unknown category', () => {
    expect(PlaceSeed.safeParse({ ...place, category: 'bar' }).success).toBe(false)
  })
})

describe('seed files', () => {
  const root = join(__dirname, '../../data/seed')
  const read = (p: string): unknown => JSON.parse(readFileSync(join(root, p), 'utf8'))

  it('destinations.json parses and has the 5 MVP destinations', () => {
    const rows = DestinationSeed.array().parse(read('destinations.json'))
    expect(rows.map((r) => r.id).sort()).toEqual(['ha-giang', 'ha-long', 'ha-noi', 'ninh-binh', 'sapa'])
  })
  it('bus_routes.json parses', () => {
    expect(() => BusRouteSeed.array().parse(read('bus_routes.json'))).not.toThrow()
  })
  it('every places file parses', () => {
    for (const f of readdirSync(join(root, 'places')).filter((f) => f.endsWith('.json'))) {
      expect(() => PlaceSeed.array().parse(read(`places/${f}`)), f).not.toThrow()
    }
  })
})
