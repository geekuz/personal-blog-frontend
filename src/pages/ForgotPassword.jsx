import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function ForgotPassword() {
  useDocumentMeta({ title: 'Reset password — otabek.dev' })
  const { forgotPassword } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setError('')
    setMessage('')
    setIsSubmitting(true)
    const form = new FormData(formElement)
    try {
      const response = await forgotPassword(form.get('email'))
      setMessage(response.message)
      formElement.reset()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-heading">Reset your password</h1>
      <p className="mt-2 text-muted">Enter your account email. If it matches an account, we’ll send a single-use link that expires in 30 minutes.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-heading">
          Email
          <input required name="email" type="email" autoComplete="email" maxLength="254" className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent" />
        </label>
        {message && <p role="status" className="text-sm text-green-700 dark:text-green-400">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted"><Link to="/login" className="text-accent hover:underline">Back to log in</Link></p>
    </section>
  )
}

export default ForgotPassword
