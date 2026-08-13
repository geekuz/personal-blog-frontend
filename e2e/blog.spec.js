import { expect, test } from '@playwright/test'

const posts = [
  {
    slug: 'hello-world',
    title: 'Hello, World — Starting My Blog',
    summary: 'Starting the blog.',
    tags: ['meta', 'react'],
    publishedAt: '2026-06-23T00:00:00Z',
    readingTimeMinutes: 1,
  },
  {
    slug: 'why-i-chose-react',
    title: 'Why I Chose React to Learn First',
    summary: 'Why React is a solid first framework.',
    tags: ['react', 'learning'],
    publishedAt: '2026-06-18T09:00:00Z',
    readingTimeMinutes: 1,
  },
  {
    slug: 'styling-with-tailwind',
    title: 'Styling This Blog with Tailwind',
    summary: 'Styling with utility classes.',
    tags: ['tailwind', 'css', 'design'],
    publishedAt: '2026-06-10T00:00:00Z',
    readingTimeMinutes: 1,
  },
]

test.beforeEach(async ({ page }) => {
  await page.route('http://localhost:8080/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/v1/tags') {
      await route.fulfill({ json: { items: [...new Set(posts.flatMap((post) => post.tags))].map((slug) => ({ name: slug, slug, postCount: 1 })) } })
      return
    }
    if (url.pathname === '/api/v1/posts') {
      const query = (url.searchParams.get('q') ?? '').toLowerCase()
      const tag = url.searchParams.get('tag')
      const items = posts.filter((post) =>
        (!query || `${post.title} ${post.summary}`.toLowerCase().includes(query)) &&
        (!tag || post.tags.includes(tag)),
      )
      await route.fulfill({ json: { items, page: 0, size: 6, totalItems: items.length, totalPages: items.length ? 1 : 0, hasNext: false } })
      return
    }
    if (url.pathname === '/api/v1/posts/hello-world') {
      await route.fulfill({ json: { ...posts[0], content: '## Why build a blog?' } })
      return
    }
    await route.fulfill({ status: 404, json: { code: 'POST_NOT_FOUND', message: 'Post not found' } })
  })
})

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
