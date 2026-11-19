import { VN_OUTLINE } from '@/lib/map/geo'

// Flat outline used as the instant first paint (and the no-WebGL fallback) before the 3D map loads.
const W = 120
const H = 220
const minLon = 102
const maxLat = 23.6
const scale = 14.2
const d = VN_OUTLINE.map(([lo, la], i) => `${i ? 'L' : 'M'}${((lo - minLon) * scale).toFixed(1)} ${((maxLat - la) * scale * 0.72).toFixed(1)}`).join(' ') + 'Z'

export function VietnamOutline({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
      <path d={d} fill="#2a8a67" stroke="#9fe3c4" strokeOpacity="0.5" strokeWidth="0.8" />
    </svg>
  )
}
