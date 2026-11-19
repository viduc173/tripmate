import { expect, test } from '@playwright/test'
import { buildItineraryView } from '@/lib/itinerary/view'
import { SAMPLE_SAPA } from '@/lib/itinerary/sample'
import { formatVnd } from '@/lib/money'

const expected = buildItineraryView(SAMPLE_SAPA).cost

test.use({ viewport: { width: 360, height: 780 } })

test('sample itinerary: legs, light day, reorder, totals, offline', async ({ page, context }) => {
  await page.goto('/demo')
  await expect(page.getByTestId('trip-title')).toHaveText('Sa Pa 3N2Đ')

  // Legs are their own cards, outbound before the days and return after them.
  const order = await page.locator('[data-testid^="leg-"], [data-testid="day"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
  expect(order).toEqual(['leg-outbound', 'day', 'day', 'day', 'leg-return'])

  // Overnight bus arriving 05:30: light first day from 06:00.
  const day1 = page.getByTestId('day').first()
  await expect(day1.getByTestId('light-day')).toBeVisible()
  await expect(day1.getByTestId('spot-time').first()).toHaveText('06:00')

  // Header totals match estimateTrip for the same data.
  await expect(page.getByTestId('per-person')).toHaveText(`${formatVnd(expected.perPerson)}/người`)
  await expect(page.getByTestId('group-total')).toHaveText(`Cả nhóm ${formatVnd(expected.total)}`)

  // Move the first stop down: it becomes second and its start time changes.
  const firstName = await day1.getByTestId('spot').first().getAttribute('data-place')
  await day1.getByRole('button', { name: /^Chuyển xuống: / }).first().click()
  await expect(day1.getByTestId('spot').nth(1)).toHaveAttribute('data-place', firstName!)
  await expect(day1.getByTestId('spot-time').first()).toHaveText('06:00')
  await expect(day1.getByTestId('spot-time').nth(1)).not.toHaveText('07:10')

  // No horizontal scroll at 360 px.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  // Offline reload still renders the last viewed itinerary.
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, { timeout: 10_000 }).catch(async () => {
    await page.reload()
    await page.waitForFunction(() => navigator.serviceWorker?.controller != null)
  })
  await page.reload()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByTestId('trip-title')).toHaveText('Sa Pa 3N2Đ')
  await context.setOffline(false)
})

test('English sample shows English labels', async ({ page }) => {
  await page.goto('/en/demo')
  await expect(page.getByText('Outbound').first()).toBeVisible()
  await expect(page.getByTestId('per-person')).toContainText('/person')
})
