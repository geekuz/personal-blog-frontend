import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import NewsletterAction from './NewsletterAction'

const base = 'http://localhost:8080/api/v1'

function handlers(path, message) {
  return [
    http.get(`${base}/auth/csrf`, () => HttpResponse.json({
      headerName: 'X-CSRF-TOKEN', token: 'test-csrf',
    })),
    http.post(`${base}${path}`, async ({ request }) => {
      expect((await request.json()).token).toBe('secure-token')
      return HttpResponse.json({ message })
    }),
  ]
}

describe('NewsletterAction', () => {
  it('confirms a subscription only after an explicit click', async () => {
    server.use(...handlers('/newsletter/public/confirm', 'Your subscription is confirmed.'))
    render(
      <MemoryRouter initialEntries={['/newsletter/confirm?token=secure-token']}>
        <NewsletterAction type="confirm" />
      </MemoryRouter>,
    )
    const button = screen.getByRole('button', { name: 'Confirm subscription' })
    await userEvent.click(button)
    expect(await screen.findByRole('heading', { name: 'Your subscription is confirmed.' })).toBeInTheDocument()
  })

  it('unsubscribes only after an explicit click', async () => {
    server.use(...handlers('/newsletter/public/unsubscribe', 'You have been unsubscribed.'))
    render(
      <MemoryRouter initialEntries={['/newsletter/unsubscribe?token=secure-token']}>
        <NewsletterAction type="unsubscribe" />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Unsubscribe' }))
    expect(await screen.findByRole('heading', { name: 'You have been unsubscribed.' })).toBeInTheDocument()
  })

  it('does not offer an action when the token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/newsletter/confirm']}>
        <NewsletterAction type="confirm" />
      </MemoryRouter>,
    )
    expect(screen.getByText(/missing its secure token/i)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
