/**
 * Display details for the 5 verified destinations. Travel times from Hà Nội are estimates from the
 * destination research (to be confirmed with coach data).
 */
export const DEST_META: Record<string, { lon: number; lat: number; tone: string; travel_vi: string; travel_en: string }> = {
  sapa: { lon: 103.84, lat: 22.34, tone: 'bg-[#1f6b54]', travel_vi: 'xe 5–6 giờ', travel_en: '5–6 h by coach' },
  'ha-giang': { lon: 104.98, lat: 22.82, tone: 'bg-[#8b5a2b]', travel_vi: 'xe 6–7 giờ', travel_en: '6–7 h by coach' },
  'ninh-binh': { lon: 105.97, lat: 20.25, tone: 'bg-[#4d6b3a]', travel_vi: 'xe 1,5–2 giờ', travel_en: '1.5–2 h by coach' },
  'ha-long': { lon: 107.0, lat: 20.98, tone: 'bg-[#2d5f7a]', travel_vi: 'xe 2,5–3 giờ', travel_en: '2.5–3 h by coach' },
  'ha-noi': { lon: 105.85, lat: 21.03, tone: 'bg-[#7a3b3b]', travel_vi: 'điểm xuất phát', travel_en: 'starting point' },
}

/** Display order on Explore: the mountain trips people ask about most first. */
export const DEST_ORDER = ['sapa', 'ha-giang', 'ninh-binh', 'ha-long', 'ha-noi']
