import { expect, test } from '@playwright/test'

const pages = ['/', '/plan', '/trips', '/me', '/demo', '/en']

for (const vp of [{ width: 360, height: 780 }, { width: 1280, height: 800 }]) {
  test.describe(`${vp.width}px`, () => {
    test.use({ viewport: vp })

    for (const path of pages) {
      test(`${path}: no horizontal scroll, tab targets ≥ 24px`, async ({ page }) => {
        await page.goto(path)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        const tabs = page.getByRole('navigation', { name: /Điều hướng chính|Main navigation/ }).getByRole('link').filter({ hasNotText: 'TripMate' })
        await expect(tabs).toHaveCount(4)
        for (const box of await tabs.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
          expect(box.width).toBeGreaterThanOrEqual(24)
          expect(box.height).toBeGreaterThanOrEqual(24)
        }
      })
    }

    test('tab bar position and active tab', async ({ page }) => {
      await page.goto('/trips')
      const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
      const box = (await nav.boundingBox())!
      if (vp.width < 768) expect(box.y + box.height).toBeGreaterThan(vp.height - 2)
      else expect(box.y).toBeLessThan(10)
      await expect(nav.getByRole('link', { name: 'Chuyến đi' })).toHaveAttribute('aria-current', 'page')
      await expect(nav.getByRole('link', { name: 'Lên lịch' })).not.toHaveAttribute('aria-current', 'page')
    })
  })
}

test('English labels and long province names wrap at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/en')
  await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible()
  await page.goto('/')
  await expect(page.getByText('Tuyên Quang (Hà Giang cũ)')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('reduced motion: switching tabs leaves nothing mid-transition', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 360, height: 780 } })
  const page = await ctx.newPage()
  await page.goto('/')
  await page.getByRole('link', { name: 'Chuyến đi' }).click()
  await page.waitForURL('**/trips')
  const opacities = await page.locator('[data-page], [data-page] *').evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity))
  expect(opacities.every((o) => o === '1')).toBe(true)
  await ctx.close()
})

test('route transition finishes under 400ms', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Chuyến đi' }).click()
  await page.waitForURL('**/trips')
  const t0 = Date.now()
  await page.waitForFunction(() => {
    const m = document.querySelector('[data-page]')
    return m && getComputedStyle(m).opacity === '1' && getComputedStyle(m).transform === 'none'
  })
  expect(Date.now() - t0).toBeLessThan(400)
})
