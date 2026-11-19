/**
 * Rule-based reading of a Vietnamese trip request ("Sa Pa 3N2Đ, 4 người, tầm 8 triệu").
 * It runs before the LangGraph planner exists and stays as the fast path afterwards: cheap,
 * deterministic, and never invents values.
 */
export type TripRequest = {
  destinationId?: string
  unverifiedDestination?: string
  days?: number
  nights?: number
  party?: number
  budgetVnd?: number
  budgetScope?: 'group' | 'person'
  origin?: 'ha-noi' | 'tp-hcm' | 'other'
}

export type Field = 'destination' | 'duration' | 'party' | 'budget' | 'scope' | 'origin'

const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

const VERIFIED: [RegExp, string][] = [
  [/\bsa ?pa\b/, 'sapa'],
  [/\bha giang\b/, 'ha-giang'],
  [/\bninh binh\b|\btrang an\b|\btam coc\b/, 'ninh-binh'],
  [/\bha long\b|\bhalong\b/, 'ha-long'],
]

const UNVERIFIED: [RegExp, string][] = [
  [/\bda nang\b/, 'Đà Nẵng'],
  [/\bhoi an\b/, 'Hội An'],
  [/\bhue\b/, 'Huế'],
  [/\bda lat\b/, 'Đà Lạt'],
  [/\bnha trang\b/, 'Nha Trang'],
  [/\bphu quoc\b/, 'Phú Quốc'],
  [/\bvung tau\b/, 'Vũng Tàu'],
  [/\bcan tho\b/, 'Cần Thơ'],
  [/\bquy nhon\b/, 'Quy Nhơn'],
]

const num = (s: string) => Number(s.replace(',', '.'))

export function parseRequest(text: string): TripRequest {
  const t = fold(text)
  const out: TripRequest = {}

  const origin = /\btu (ha noi|hn)\b/.test(t) ? 'ha-noi' : /\btu (tp ?\.? ?hcm|hcm|sai gon|sg)\b/.test(t) ? 'tp-hcm' : undefined
  if (origin) out.origin = origin
  // "Hà Nội" as the starting point is not a destination.
  const destText = t.replace(/\btu (ha noi|hn)\b/g, ' ')
  const verified = VERIFIED.find(([re]) => re.test(destText))
  if (verified) out.destinationId = verified[1]
  else if (/\b(di|toi|den|o) ha noi\b/.test(destText)) out.destinationId = 'ha-noi'
  else {
    const other = UNVERIFIED.find(([re]) => re.test(destText))
    if (other) out.unverifiedDestination = other[1]
  }

  let m: RegExpMatchArray | null
  if (/\btrong ngay\b/.test(t)) Object.assign(out, { days: 1, nights: 0 })
  else if ((m = t.match(/\b(\d{1,2}) ?n ?(\d{1,2}) ?d\b/))) Object.assign(out, { days: +m[1], nights: +m[2] })
  else if ((m = t.match(/\b(\d{1,2}) ?ngay ?(\d{1,2}) ?dem\b/))) Object.assign(out, { days: +m[1], nights: +m[2] })
  else if ((m = t.match(/\b(\d{1,2}) ?ngay\b/))) Object.assign(out, { days: +m[1], nights: Math.max(0, +m[1] - 1) })

  if ((m = t.match(/\b(\d{1,2}) ?(nguoi|ng)\b/)) && !/\bmoi \d/.test(t)) out.party = +m[1]

  if ((m = t.match(/\b(\d+(?:[.,]\d+)?) ?(trieu|tr)\b/))) out.budgetVnd = Math.round(num(m[1]) * 1_000_000)
  else if ((m = t.match(/\b(\d+) ?k\b/))) out.budgetVnd = +m[1] * 1000
  else if ((m = t.match(/\b(\d{1,3}(?:[.,]\d{3}){2,})\b/))) out.budgetVnd = Number(m[1].replace(/[.,]/g, ''))

  if (/\b(moi nguoi|1 nguoi|mot nguoi|\/ ?nguoi|per person)\b/.test(t)) out.budgetScope = 'person'
  else if (/\b(ca nhom|tong|tat ca|ca doan)\b/.test(t)) out.budgetScope = 'group'

  return out
}

export function missingFields(r: TripRequest): Field[] {
  const missing: Field[] = []
  if (!r.destinationId && !r.unverifiedDestination) missing.push('destination')
  if (r.days === undefined) missing.push('duration')
  if (r.party === undefined) missing.push('party')
  if (r.budgetVnd === undefined) missing.push('budget')
  if (!r.budgetScope) missing.push('scope')
  if (!r.origin) missing.push('origin')
  return missing
}
