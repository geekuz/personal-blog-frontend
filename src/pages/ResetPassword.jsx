import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function ResetPassword() {
  useDocumentMeta({ title: 'Choose a new password — otabek.dev' })
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const newPassword = form.get('newPassword')
    if (newPassword !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword })
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset complete. All existing sessions were signed out; log in with your new password.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-heading">Reset link missing</h1>
        <p role="alert" className="mt-4 text-muted">This reset link is incomplete. Request a new one to continue.</p>
        <Link to="/forgot-password" className="mt-6 inline-block text-accent hover:underline">Request a new reset link</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-heading">Choose a new password</h1>
      <p className="mt-2 text-muted">Use at least 12 characters. Completing this reset signs out every existing session.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <PasswordField label="New password" name="newPassword" />
        <PasswordField label="Confirm new password" name="confirmPassword" />
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {isSubmitting ? 'Resetting password…' : 'Reset password'}
        </button>
      </form>
    </section>
  )
}

function PasswordField({ label, name }) {
  return (
    <label className="block text-sm font-medium text-heading">
      {label}
      <input required name={name} type="password" autoComplete="new-password" minLength="12" maxLength="72" className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent" />
    </label>
  )
}

export default ResetPassword
