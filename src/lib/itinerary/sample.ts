import type { ItineraryInput } from './view'

/**
 * Illustrative sample for the demo page and e2e tests only. Not stored in the database and
 * shown with a "Bản mẫu" banner: names are real Sa Pa spots, prices and times are made up.
 */
export const SAMPLE_SAPA: ItineraryInput = {
  startDate: '2026-11-21',
  days: 3,
  nights: 2,
  party: 4,
  transport: 'coach_grab',
  budgetVnd: 8_000_000,
  budgetScope: 'group',
  roomPriceVnd: 350_000,
  outbound: { operator: 'Xe giường nằm (mẫu)', departTime: '22:00', arriveTime: '05:30', overnight: true, priceVnd: 300_000 },
  return: { operator: 'Limousine (mẫu)', departTime: '14:00', arriveTime: '19:30', overnight: false, priceVnd: 350_000 },
  // Illustrative weather for the sample only (Sa Pa in late November: clear, foggy, drizzle).
  weatherByDay: ['clear', 'fog', 'rain'],
  items: [
    { itemId: 'd0-1', dayIndex: 0, position: 0, place: { id: 'pho-sapa', name: 'Ăn sáng, gửi đồ ở homestay', category: 'food', durationMin: 60, priceVnd: 0, lat: 22.3356, lng: 103.8433 } },
    { itemId: 'd0-2', dayIndex: 0, position: 1, place: { id: 'cat-cat', name: 'Bản Cát Cát', category: 'sight', durationMin: 150, priceVnd: 150_000, lat: 22.3296, lng: 103.8344 } },
    { itemId: 'd0-3', dayIndex: 0, position: 2, place: { id: 'cho-sapa', name: 'Chợ Sa Pa', category: 'market', durationMin: 60, priceVnd: 0, lat: 22.3372, lng: 103.8445 } },
    { itemId: 'd1-1', dayIndex: 1, position: 0, place: { id: 'fansipan', name: 'Cáp treo Fansipan', category: 'sight', durationMin: 240, priceVnd: 800_000, lat: 22.3086, lng: 103.7766 } },
    { itemId: 'd1-2', dayIndex: 1, position: 1, place: { id: 'nha-tho-da', name: 'Nhà thờ Đá Sa Pa', category: 'sight', durationMin: 45, priceVnd: 0, lat: 22.3364, lng: 103.8427 } },
    { itemId: 'd2-1', dayIndex: 2, position: 0, place: { id: 'ta-van', name: 'Bản Tả Van', category: 'sight', durationMin: 180, priceVnd: 75_000, lat: 22.3004, lng: 103.8828 } },
  ],
}
