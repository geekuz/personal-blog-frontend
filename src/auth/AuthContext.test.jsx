import { describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import Login from '../pages/Login'
import Account from '../pages/Account'
import VerifyEmail from '../pages/VerifyEmail'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import { server } from '../test/server'

const base = 'http://localhost:8080/api/v1'

function authHandlers({ emailVerified = false } = {}) {
  let authenticated = false
  const user = {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'reader@example.com',
    displayName: 'Reader One',
    emailVerified,
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
    http.post(`${base}/auth/password/forgot`, async ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('anonymous-token')
      expect(await request.json()).toEqual({ email: 'reader@example.com' })
      return HttpResponse.json({ message: 'If an account exists for that email, a password reset link has been sent.' }, { status: 202 })
    }),
    http.post(`${base}/auth/password/reset`, async ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('anonymous-token')
      expect(await request.json()).toEqual({ token: 'reset-token', newPassword: 'a-new-secure-password' })
      return new HttpResponse(null, { status: 204 })
    }),
    http.post(`${base}/auth/password/change`, async ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('authenticated-token')
      expect(await request.json()).toEqual({ currentPassword: 'a-secure-password', newPassword: 'a-new-secure-password' })
      authenticated = false
      return new HttpResponse(null, { status: 204 })
    }),
    http.get(`${base}/newsletter/subscription`, () => HttpResponse.json({ subscribed: false })),
    http.post(`${base}/newsletter/subscription`, ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('authenticated-token')
      return HttpResponse.json({ subscribed: true })
    }),
    http.delete(`${base}/newsletter/subscription`, ({ request }) => {
      expect(request.headers.get('x-csrf-token')).toBe('authenticated-token')
      return new HttpResponse(null, { status: 204 })
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

  it('requests a reset without revealing whether the account exists', async () => {
    server.use(...authHandlers())
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <AuthProvider>
          <Routes><Route path="/forgot-password" element={<ForgotPassword />} /></Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Email'), 'reader@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByRole('status')).toHaveTextContent('If an account exists')
  })

  it('resets a password and returns to login with a signed-out message', async () => {
    server.use(...authHandlers())
    render(
      <MemoryRouter initialEntries={['/reset-password?token=reset-token']}>
        <AuthProvider>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('New password'), 'a-new-secure-password')
    await user.type(screen.getByLabelText('Confirm new password'), 'a-new-secure-password')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('All existing sessions were signed out')
  })

  it('changes a password and signs the account out', async () => {
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
    await user.type(await screen.findByLabelText('Current password'), 'a-secure-password')
    await user.type(screen.getByLabelText(/^New password/), 'a-new-secure-password')
    await user.type(screen.getByLabelText('Confirm new password'), 'a-new-secure-password')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('All sessions were signed out')
  })

  it('lets a verified user subscribe and unsubscribe from the newsletter', async () => {
    server.use(...authHandlers({ emailVerified: true }))
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
    await user.click(await screen.findByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByRole('status')).toHaveTextContent('You are subscribed')
    await user.click(screen.getByRole('button', { name: 'Unsubscribe' }))
    expect(await screen.findByRole('status')).toHaveTextContent('You have unsubscribed')
  })
})
