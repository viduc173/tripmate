// Ước lượng, cập nhật khi có dữ liệu. All values are integer VND.

/** Grab 4-seat car, per km (ước lượng, cập nhật khi có dữ liệu). */
export const GRAB_4_SEAT_PER_KM = 12_000
/** Grab 7-seat car, per km (ước lượng, cập nhật khi có dữ liệu). */
export const GRAB_7_SEAT_PER_KM = 15_000
/** Motorbike fuel per km per bike (ước lượng, cập nhật khi có dữ liệu). */
export const MOTORBIKE_FUEL_PER_KM = 1_000
/** People per room and per motorbike. */
export const PEOPLE_PER_ROOM = 2
export const PEOPLE_PER_BIKE = 2
/** Room per night when no stay is chosen yet (ước lượng, cập nhật khi có dữ liệu). */
export const DEFAULT_ROOM_PER_NIGHT = 350_000
/** Food per person per day (ước lượng, cập nhật khi có dữ liệu). */
export const FOOD_PER_PERSON_PER_DAY = 300_000
/** Tickets per person per day before places are chosen (ước lượng, cập nhật khi có dữ liệu). */
export const TICKETS_PER_PERSON_PER_DAY = 150_000
/** Local rides per day before places are chosen (ước lượng, cập nhật khi có dữ liệu). */
export const RIDE_KM_PER_DAY = 10
/** One-way coach fare from Hà Nội per person (ước lượng, cập nhật khi có dữ liệu nhà xe). */
export const COACH_FARE_FROM_HANOI: Record<string, number> = {
  sapa: 325_000,
  'ha-giang': 350_000,
  'ninh-binh': 150_000,
  'ha-long': 200_000,
  'ha-noi': 0,
}
