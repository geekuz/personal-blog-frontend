import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import StatusMessage from '../components/ui/StatusMessage'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function Account() {
  useDocumentMeta({ title: 'Account — otabek.dev' })
  const { user, isLoading, logout, resendVerification } = useAuth()
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const navigate = useNavigate()
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
      <button onClick={signOut} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-heading hover:border-accent">Log out</button>
    </section>
  )
}

export default Account
