import { expect, test } from '@playwright/test'

test('loads and filters posts from the Spring Boot API', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Hello, World — Starting My Blog' })).toBeVisible()
  await page.getByRole('searchbox').fill('react')
  await expect(page).toHaveURL(/q=react/i)
  await expect(page.getByRole('link', { name: 'Why I Chose React to Learn First' })).toBeVisible()

  await page.getByRole('button', { name: '#learning' }).click()
  await expect(page).toHaveURL(/tag=learning/)
  await expect(page.getByRole('link', { name: 'Why I Chose React to Learn First' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Hello, World — Starting My Blog' })).toHaveCount(0)
})

test('loads post details and handles missing posts through the API', async ({ page }) => {
  await page.goto('/blog/why-i-chose-react')
  await expect(page.getByRole('heading', { name: 'Why I Chose React to Learn First' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The whole model is small' })).toBeVisible()

  await page.goto('/blog/missing-post')
  await expect(page.getByRole('heading', { name: /Page not found/i })).toBeVisible()
})

test('recovers an out-of-range backend page', async ({ page }) => {
  await page.goto('/?page=99')

  await expect(page).toHaveURL('http://localhost:5173/')
  await expect(page.getByRole('link', { name: 'Hello, World — Starting My Blog' })).toBeVisible()
})
