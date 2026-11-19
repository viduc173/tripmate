import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 360, height: 780 } })

test('chat planner: free text fills fields, quick replies ask the rest, estimate shows', async ({ page }) => {
  await page.goto('/plan')
  await expect(page.getByRole('tab', { name: 'Chat' })).toHaveAttribute('aria-selected', 'true')
  const input = page.getByPlaceholder('Nhắn cho TripMate…')
  await input.fill('Sa Pa 3N2Đ, 4 người, tầm 8 triệu')
  await input.press('Enter')
  await expect(page.getByText('Số tiền đó là cho cả nhóm hay mỗi người?')).toBeVisible()
  await page.getByRole('button', { name: 'Cả nhóm' }).click()
  await page.getByRole('button', { name: 'Hà Nội', exact: true }).click()
  await expect(page.getByTestId('chat-estimate')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('plan page prefills destination from ?d=', async ({ page }) => {
  await page.goto('/plan?d=ninh-binh')
  const input = page.getByPlaceholder('Nhắn cho TripMate…')
  await input.fill('2N1Đ, 2 người, 3 triệu cả nhóm, từ Hà Nội')
  await input.press('Enter')
  await expect(page.getByTestId('chat-estimate')).toContainText('Ninh Bình')
})

test('dark mode: choice persists across reloads and sets data-theme', async ({ page }) => {
  await page.goto('/me')
  await page.getByRole('radio', { name: 'Tối' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.goto('/demo')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).not.toBe('rgb(242, 244, 241)')
})
