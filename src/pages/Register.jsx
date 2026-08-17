import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function Register() {
  useDocumentMeta({ title: 'Create account — otabek.dev' })
  const { user, isLoading, register } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  if (!isLoading && user) return <Navigate to="/account" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const password = form.get('password')
    if (password !== form.get('confirmPassword')) {
      setError('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await register({ displayName: form.get('displayName'), email: form.get('email'), password })
      navigate('/account', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-heading">Create account</h1>
      <p className="mt-2 text-muted">Your account will unlock comments and email subscriptions.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Display name" name="displayName" autoComplete="name" maxLength="80" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength="12" maxLength="72" hint="At least 12 characters" />
        <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" minLength="12" maxLength="72" />
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">Already registered? <Link to="/login" className="text-accent hover:underline">Log in</Link>.</p>
    </section>
  )
}

function Field({ label, hint, ...props }) {
  return <label className="block text-sm font-medium text-heading">{label}<input required className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent" {...props} />{hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}</label>
}

export default Register
