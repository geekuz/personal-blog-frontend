import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function Login() {
  useDocumentMeta({ title: 'Log in — otabek.dev' })
  const { user, isLoading, login } = useAuth()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (!isLoading && user) return <Navigate to="/account" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      await login({ email: form.get('email'), password: form.get('password') })
      navigate(location.state?.from ?? '/account', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-heading">Log in</h1>
      <p className="mt-2 text-muted">Join the conversation and manage your subscription.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">No account yet? <Link to="/register" className="text-accent hover:underline">Create one</Link>.</p>
    </section>
  )
}

function Field({ label, ...props }) {
  return <label className="block text-sm font-medium text-heading">{label}<input required className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent" {...props} /></label>
}

export default Login
