import { describe, expect, it } from 'vitest'
import { missingFields, parseRequest } from '@/lib/chat/parseRequest'

describe('parseRequest', () => {
  it('reads the mockup sentence', () => {
    expect(parseRequest('Mình muốn đi Sa Pa 3N2Đ, 4 người, tầm 8 triệu')).toEqual({
      destinationId: 'sapa', days: 3, nights: 2, party: 4, budgetVnd: 8_000_000,
    })
  })
  it('reads origin and scope from a follow-up', () => {
    expect(parseRequest('Từ Hà Nội, cả nhóm')).toEqual({ origin: 'ha-noi', budgetScope: 'group' })
    expect(parseRequest('mỗi người 2tr')).toEqual({ budgetScope: 'person', budgetVnd: 2_000_000 })
  })
  it('understands words, no accents and other number formats', () => {
    expect(parseRequest('di ha giang 4 ngay 3 dem 2 nguoi 5,5 trieu')).toEqual({
      destinationId: 'ha-giang', days: 4, nights: 3, party: 2, budgetVnd: 5_500_000,
    })
    expect(parseRequest('Ninh Bình trong ngày, 800k')).toEqual({ destinationId: 'ninh-binh', days: 1, nights: 0, budgetVnd: 800_000 })
    expect(parseRequest('hạ long 2 ngày, ngân sách 3.000.000')).toEqual({ destinationId: 'ha-long', days: 2, nights: 1, budgetVnd: 3_000_000 })
  })
  it('flags a destination we have no data for', () => {
    expect(parseRequest('tôi muốn đi Đà Nẵng 3 ngày')).toMatchObject({ unverifiedDestination: 'Đà Nẵng', days: 3 })
  })
  it('ignores text with nothing useful', () => {
    expect(parseRequest('xin chào')).toEqual({})
  })
})

describe('missingFields', () => {
  it('asks in order: destination, duration, party, budget, scope, origin', () => {
    expect(missingFields({})).toEqual(['destination', 'duration', 'party', 'budget', 'scope', 'origin'])
    expect(missingFields({ destinationId: 'sapa', days: 3, nights: 2, party: 4, budgetVnd: 8e6 })).toEqual(['scope', 'origin'])
  })
})
