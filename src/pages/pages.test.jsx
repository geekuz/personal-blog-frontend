import { describe, expect, it } from 'vitest'
import { HttpResponse, delay, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from './Home'
import PostPage from './PostPage'
import { server } from '../test/server'

const post = {
  slug: 'api-post', title: 'API post', summary: 'From the service',
  tags: ['react'], publishedAt: '2026-06-23T12:00:00Z',
  readingTimeMinutes: 2,
}

function renderRoute(element, path = '/', routePath = '*') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Home API states', () => {
  it('shows loading then API posts', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/posts', async () => {
        await delay(50)
        return HttpResponse.json({ items: [post], page: 0, size: 6, totalItems: 1, totalPages: 1, hasNext: false })
      }),
      http.get('http://localhost:8080/api/v1/tags', () => HttpResponse.json({ items: [{ name: 'React', slug: 'react', postCount: 1 }] })),
    )
    renderRoute(<Home />)
    expect(screen.getByText('Loading posts…')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'API post' })).toBeInTheDocument()
  })

  it('shows an empty result', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/posts', () => HttpResponse.json({ items: [], page: 0, size: 6, totalItems: 0, totalPages: 0, hasNext: false })),
      http.get('http://localhost:8080/api/v1/tags', () => HttpResponse.json({ items: [] })),
    )
    renderRoute(<Home />)
    expect(await screen.findByText(/No posts match/)).toBeInTheDocument()
  })

  it('offers a working retry after an API error', async () => {
    let attempts = 0
    server.use(
      http.get('http://localhost:8080/api/v1/posts', () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json({ items: [post], page: 0, size: 6, totalItems: 1, totalPages: 1, hasNext: false })
      }),
      http.get('http://localhost:8080/api/v1/tags', () => HttpResponse.json({ items: [] })),
    )
    renderRoute(<Home />)
    const retry = await screen.findByRole('button', { name: 'Try again' })
    await userEvent.click(retry)
    expect(await screen.findByRole('link', { name: 'API post' })).toBeInTheDocument()
  })

  it('recovers from a page beyond the final page', async () => {
    const requestedPages = []
    server.use(
      http.get('http://localhost:8080/api/v1/posts', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'))
        requestedPages.push(page)
        return HttpResponse.json(page === 0
          ? { items: [post], page: 0, size: 6, totalItems: 1, totalPages: 1, hasNext: false }
          : { items: [], page, size: 6, totalItems: 1, totalPages: 1, hasNext: false })
      }),
      http.get('http://localhost:8080/api/v1/tags', () => HttpResponse.json({ items: [] })),
    )

    renderRoute(<Home />, '/?page=99')

    expect(await screen.findByRole('link', { name: 'API post' })).toBeInTheDocument()
    expect(requestedPages).toEqual([99, 0])
  })
})

describe('PostPage API states', () => {
  it('renders a successful post response', async () => {
    server.use(http.get('http://localhost:8080/api/v1/posts/api-post', () => HttpResponse.json({ ...post, content: '## Loaded content' })))
    renderRoute(<PostPage />, '/blog/api-post', '/blog/:slug')
    expect(await screen.findByRole('heading', { name: 'API post' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Loaded content' })).toBeInTheDocument()
  })

  it('renders not found for a missing post', async () => {
    server.use(http.get('http://localhost:8080/api/v1/posts/missing', () => HttpResponse.json({ code: 'POST_NOT_FOUND' }, { status: 404 })))
    renderRoute(<PostPage />, '/blog/missing', '/blog/:slug')
    expect(await screen.findByRole('heading', { name: /Page not found/i })).toBeInTheDocument()
  })
})
