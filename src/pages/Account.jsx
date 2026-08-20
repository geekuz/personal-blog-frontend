import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import StatusMessage from '../components/ui/StatusMessage'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function Account() {
  useDocumentMeta({ title: 'Account — otabek.dev' })
  const {
    user, isLoading, logout, resendVerification, changePassword,
    newsletterStatus, subscribeNewsletter, unsubscribeNewsletter,
  } = useAuth()
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [subscription, setSubscription] = useState({ status: 'loading', subscribed: false, message: '' })
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.emailVerified) return
    let active = true
    newsletterStatus()
      .then(({ subscribed }) => {
        if (active) setSubscription({ status: 'ready', subscribed, message: '' })
      })
      .catch((error) => {
        if (active) setSubscription({ status: 'error', subscribed: false, message: error.message })
      })
    return () => { active = false }
  }, [newsletterStatus, user?.emailVerified])

  if (isLoading) return <StatusMessage title="Loading account…">Checking your session.</StatusMessage>
  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />

  async function signOut() {
    await logout()
    navigate('/', { replace: true })
  }

  async function resend() {
    setVerificationMessage('')
    setVerificationError('')
    setIsSending(true)
    try {
      await resendVerification()
      setVerificationMessage('Verification email sent. Check your inbox and spam folder.')
    } catch (error) {
      setVerificationError(error.message)
    } finally {
      setIsSending(false)
    }
  }

  async function changeAccountPassword(event) {
    event.preventDefault()
    setPasswordError('')
    const form = new FormData(event.currentTarget)
    const newPassword = form.get('newPassword')
    if (newPassword !== form.get('confirmPassword')) {
      setPasswordError('New passwords do not match.')
      return
    }
    setIsChangingPassword(true)
    try {
      await changePassword({ currentPassword: form.get('currentPassword'), newPassword })
      navigate('/login', {
        replace: true,
        state: { message: 'Password changed. All sessions were signed out; log in with your new password.' },
      })
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function toggleNewsletter() {
    const wasSubscribed = subscription.subscribed
    setSubscription({ status: 'saving', subscribed: wasSubscribed, message: '' })
    try {
      if (wasSubscribed) await unsubscribeNewsletter()
      else await subscribeNewsletter()
      setSubscription({
        status: 'ready',
        subscribed: !wasSubscribed,
        message: wasSubscribed ? 'You have unsubscribed from the newsletter.' : 'You are subscribed to the newsletter.',
      })
    } catch (error) {
      setSubscription({ status: 'error', subscribed: wasSubscribed, message: error.message })
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-heading">Your account</h1>
      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="text-lg font-semibold text-heading">{user.displayName}</p>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        <p className="mt-4 text-sm text-muted">Role: {user.roles.join(', ')}</p>
        {user.emailVerified ? (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">Email verified</p>
        ) : (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted">Verify your email to unlock subscriptions and comments.</p>
            <button onClick={resend} disabled={isSending} className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-heading hover:border-accent disabled:opacity-60">
              {isSending ? 'Sending…' : 'Send verification email'}
            </button>
            {verificationMessage && <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-400">{verificationMessage}</p>}
            {verificationError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{verificationError}</p>}
          </div>
        )}
      </div>
      {user.emailVerified && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-heading">Newsletter</h2>
          <p className="mt-2 text-sm text-muted">
            Get an email when a new article is published. You can unsubscribe at any time.
          </p>
          {subscription.status === 'loading' ? (
            <p role="status" className="mt-4 text-sm text-muted">Checking subscription…</p>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleNewsletter}
                disabled={subscription.status === 'saving'}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-heading hover:border-accent disabled:opacity-60"
              >
                {subscription.status === 'saving'
                  ? 'Saving…'
                  : subscription.subscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
              {subscription.message && (
                <p role={subscription.status === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm ${subscription.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                  {subscription.message}
                </p>
              )}
            </>
          )}
        </div>
      )}
      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-heading">Change password</h2>
        <p className="mt-2 text-sm text-muted">Changing it signs your account out on every device.</p>
        <form onSubmit={changeAccountPassword} className="mt-5 space-y-4">
          <PasswordField label="Current password" name="currentPassword" autoComplete="current-password" />
          <PasswordField label="New password" name="newPassword" autoComplete="new-password" minLength="12" hint="At least 12 characters" />
          <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" minLength="12" />
          {passwordError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
          <button disabled={isChangingPassword} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
            {isChangingPassword ? 'Changing password…' : 'Change password'}
          </button>
        </form>
      </div>
      <button onClick={signOut} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-heading hover:border-accent">Log out</button>
    </section>
  )
}

function PasswordField({ label, hint, ...props }) {
  return (
    <label className="block text-sm font-medium text-heading">
      {label}
      <input required type="password" maxLength="72" className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent" {...props} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export default Account
