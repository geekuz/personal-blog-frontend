import { describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import Login from '../pages/Login'
import Account from '../pages/Account'
import VerifyEmail from '../pages/VerifyEmail'
import { server } from '../test/server'

const base = 'http://localhost:8080/api/v1'

function authHandlers() {
  let authenticated = false
  const user = {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'reader@example.com',
    displayName: 'Reader One',
    emailVerified: false,
    roles: ['USER'],
  }
  return [
    http.get(`${base}/auth/csrf`, () => HttpResponse.json({
      headerName: 'X-CSRF-TOKEN',
      token: authenticated ? 'authenticated-token' : 'anonymous-token',
    })),
    http.get(`${base}/auth/me`, () => HttpResponse.json({ authenticated, user: authenticated ? user : null })),
    http.post(`${base}/auth/login`, async ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('anonymous-token')
      authenticated = true
      return HttpResponse.json(user)
    }),
    http.post(`${base}/auth/logout`, ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('authenticated-token')
      authenticated = false
      return new HttpResponse(null, { status: 204 })
    }),
    http.post(`${base}/auth/verification/resend`, ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('authenticated-token')
      return new HttpResponse(null, { status: 202 })
    }),
    http.post(`${base}/auth/verify-email`, async ({ request }) => {
      const body = await request.json()
      expect(body.token).toBe('valid-token')
      return HttpResponse.json({ ...user, emailVerified: true })
    }),
  ]
}

describe('account authentication', () => {
  it('logs in and renders the account', async () => {
    server.use(...authHandlers())
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Email'), 'reader@example.com')
    await user.type(screen.getByLabelText('Password'), 'a-secure-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('heading', { name: 'Your account' })).toBeInTheDocument()
    expect(screen.getByText('Reader One')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send verification email' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Verification email sent')
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
  })

  it('verifies an email link', async () => {
    server.use(...authHandlers())
    render(
      <MemoryRouter initialEntries={['/verify-email?token=valid-token']}>
        <AuthProvider>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Email verified' })).toBeInTheDocument()
  })
})
