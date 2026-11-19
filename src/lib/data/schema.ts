import { z } from 'zod'

const vnd = z.number().int().nonnegative()
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:mm')
const isoDate = z.iso.date()

export const DestinationSeed = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name_vi: z.string().min(1),
  name_en: z.string().min(1),
  province_vi: z.string().min(1),
  province_en: z.string().min(1),
  region: z.enum(['bac', 'trung', 'nam']),
  verified: z.boolean(),
  lat: z.number().min(8).max(24),
  lng: z.number().min(102).max(118),
})
export type DestinationSeed = z.infer<typeof DestinationSeed>

export const PlaceSeed = z.object({
  destination_id: z.string().min(1),
  google_place_id: z.string().min(10),
  category: z.enum(['sight', 'food', 'stay', 'cafe', 'market']),
  name_vi: z.string().min(1),
  name_en: z.string().min(1),
  price_vnd: vnd,
  price_note_vi: z.string().optional(),
  price_note_en: z.string().optional(),
  duration_min: z.number().int().positive(),
  indoor: z.boolean(),
  lat: z.number().min(8).max(24),
  lng: z.number().min(102).max(118),
  price_verified_at: isoDate.optional(),
})
export type PlaceSeed = z.infer<typeof PlaceSeed>

export const BusRouteSeed = z.object({
  from_city: z.string().min(1),
  to_destination_id: z.string().min(1),
  operator: z.string().min(1),
  kind: z.enum(['sleeper', 'limousine', 'coach']),
  depart_time: time,
  arrive_time: time,
  overnight: z.boolean(),
  price_vnd: vnd,
  pickup_vi: z.string().optional(),
  phone: z.string().optional(),
  verified_at: isoDate.optional(),
})
export type BusRouteSeed = z.infer<typeof BusRouteSeed>
