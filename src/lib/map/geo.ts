/** Simplified outline of mainland Vietnam as [lon, lat]. */
export const VN_OUTLINE: [number, number][] = [[102.14,22.40],[102.7,22.7],[103.3,22.8],[103.9,22.5],[104.4,22.75],[104.9,23.15],[105.35,23.38],[105.9,22.95],[106.7,22.85],[106.7,22.0],[107.4,21.65],[107.97,21.54],[107.3,21.1],[107.0,20.85],[106.6,20.6],[106.1,20.2],[105.9,19.8],[105.7,19.2],[105.8,18.6],[106.4,18.0],[106.7,17.4],[107.2,16.8],[107.7,16.3],[108.2,16.05],[108.5,15.5],[108.9,15.0],[109.1,14.0],[109.3,13.0],[109.2,12.3],[109.15,11.6],[108.7,11.1],[108.0,10.7],[107.3,10.4],[106.8,10.3],[106.6,9.9],[106.2,9.4],[105.6,8.9],[105.1,8.6],[104.8,8.6],[104.8,9.3],[105.0,9.9],[104.5,10.4],[105.1,10.9],[105.8,11.0],[106.2,11.7],[106.4,11.97],[107.5,12.3],[107.6,13.4],[107.5,14.4],[107.6,15.4],[107.2,15.8],[106.7,16.4],[106.5,16.6],[106.2,17.2],[105.6,17.9],[105.2,18.3],[104.6,18.8],[104.0,19.2],[104.4,19.6],[104.0,20.0],[104.4,20.4],[103.6,20.7],[103.2,20.85],[102.8,21.4],[102.65,21.7]]

export type Region = 'bac' | 'trung' | 'nam'

export type MapDestination = { id: string; name: string; lon: number; lat: number; verified: boolean; region: Region }

export const REGION_VIEW: Record<Region | 'all', { lon: number; lat: number; d: number }> = {
  all: { lon: 107.2, lat: 15.2, d: 21 },
  bac: { lon: 105.6, lat: 21.5, d: 12.5 },
  trung: { lon: 107.9, lat: 14.6, d: 11 },
  nam: { lon: 106.0, lat: 10.2, d: 9 },
}

/** Unverified destinations shown greyed on the map; picking one opens the AI-suggestion flow. */
export const OTHER_DESTINATIONS: MapDestination[] = [
  { id: 'hue', name: 'Huế', lon: 107.59, lat: 16.46, verified: false, region: 'trung' },
  { id: 'da-nang', name: 'Đà Nẵng', lon: 108.2, lat: 16.05, verified: false, region: 'trung' },
  { id: 'hoi-an', name: 'Hội An', lon: 108.3, lat: 15.88, verified: false, region: 'trung' },
  { id: 'nha-trang', name: 'Nha Trang', lon: 109.15, lat: 12.24, verified: false, region: 'trung' },
  { id: 'da-lat', name: 'Đà Lạt', lon: 108.44, lat: 11.94, verified: false, region: 'trung' },
  { id: 'tp-hcm', name: 'TP.HCM', lon: 106.7, lat: 10.78, verified: false, region: 'nam' },
  { id: 'can-tho', name: 'Cần Thơ', lon: 105.78, lat: 10.03, verified: false, region: 'nam' },
  { id: 'phu-quoc', name: 'Phú Quốc', lon: 103.96, lat: 10.22, verified: false, region: 'nam' },
]

export function insideOutline(lon: number, lat: number, pts = VN_OUTLINE): boolean {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
