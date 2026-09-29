import { HttpResponse, http } from 'msw'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/server'
import NewsletterSignup from './NewsletterSignup'

const base = 'http://localhost:8080/api/v1'

function csrf() {
  return http.get(`${base}/auth/csrf`, () => HttpResponse.json({
    headerName: 'X-CSRF-TOKEN', token: 'test-csrf',
  }))
}

describe('NewsletterSignup', () => {
  it('submits an email and shows the generic confirmation message', async () => {
    let receivedEmail
    server.use(
      csrf(),
      http.post(`${base}/newsletter/public/requests`, async ({ request }) => {
        receivedEmail = (await request.json()).email
        expect(request.headers.get('X-CSRF-TOKEN')).toBe('test-csrf')
        return HttpResponse.json({
          message: 'If this address can be subscribed, a confirmation email is on its way.',
        }, { status: 202 })
      }),
    )
    render(<NewsletterSignup />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'reader@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe →' }))

    expect(await screen.findByText(/confirmation email is on its way/i)).toBeInTheDocument()
    expect(receivedEmail).toBe('reader@example.com')
    expect(screen.getByLabelText('Email address')).toHaveValue('')
  })

  it('shows a recoverable API error', async () => {
    server.use(
      csrf(),
      http.post(`${base}/newsletter/public/requests`, () => HttpResponse.json({
        message: 'Too many requests. Please try again later.',
      }, { status: 429 })),
    )
    render(<NewsletterSignup />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'reader@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe →' }))

    expect(await screen.findByText(/Too many requests/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subscribe →' })).toBeEnabled()
  })
})
