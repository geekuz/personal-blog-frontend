import { expect, test } from '@playwright/test'

test('home search and tag filters update the URL and results', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Writing' })).toBeVisible()
  await page.getByRole('searchbox').fill('React')
  await expect(page).toHaveURL(/q=React/)
  await expect(page.getByRole('link', { name: 'Why I Chose React to Learn First' })).toBeVisible()
  await page.getByRole('button', { name: '#tailwind' }).click()
  await expect(page).toHaveURL(/tag=tailwind/)
  await expect(page.getByText(/No posts match/)).toBeVisible()
})

test('a post opens directly and unknown URLs show 404', async ({ page }) => {
  await page.goto('/blog/hello-world')
  await expect(page.getByRole('heading', { name: 'Hello, World' })).toBeVisible()
  await page.goto('/unknown-route')
  await expect(page.getByRole('heading', { name: /Page not found/i })).toBeVisible()
})

test('theme survives reload and mobile layout remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: /Switch to dark mode/i })
  await toggle.click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('navigation')).toBeVisible()
})
