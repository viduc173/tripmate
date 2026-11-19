import { z } from 'zod'

export const DURATION_PRESETS = [
  { label: 'Trong ngày', days: 1, nights: 0 },
  { label: '2N1Đ', days: 2, nights: 1 },
  { label: '3N2Đ', days: 3, nights: 2 },
  { label: '4N3Đ', days: 4, nights: 3 },
] as const

/** "3N2Đ" style label; custom durations use the same pattern. */
export function durationLabel(days: number, nights: number): string {
  if (days === 1 && nights === 0) return 'Trong ngày'
  return `${days}N${nights}Đ`
}

export const TripInput = z
  .object({
    destinationId: z.string().min(1),
    startDate: z.iso.date(),
    days: z.number().int().min(1).max(14),
    nights: z.number().int().min(0).max(13),
    party: z.number().int().min(1).max(20),
    budgetVnd: z.number().int().positive(),
    budgetScope: z.enum(['group', 'person']),
    transport: z.enum(['motorbike', 'coach_grab']),
    outboundRouteId: z.uuid().optional(),
    returnRouteId: z.uuid().optional(),
  })
  .refine((t) => t.nights <= t.days, { path: ['nights'], message: 'nights must not exceed days' })

export type TripInput = z.infer<typeof TripInput>
