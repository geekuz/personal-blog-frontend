import { useState } from 'react'
import { requestPublicSubscription } from '../../api/newsletter'

function NewsletterSignup({ compact = false }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) return
    setState({ status: 'submitting', message: '' })
    try {
      const response = await requestPublicSubscription(normalizedEmail)
      setEmail('')
      setState({ status: 'success', message: response.message })
    } catch (error) {
      setState({
        status: 'error',
        message: error.message ?? 'The newsletter service is unavailable.',
      })
    }
  }

  return (
    <section
      aria-labelledby={compact ? 'post-newsletter-heading' : 'newsletter-heading'}
      className={`relative overflow-hidden border border-border bg-surface ${compact ? 'mt-14 p-6 sm:p-8' : 'mt-14 p-7 sm:mt-18 sm:p-10'}`}
    >
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div className={`relative grid gap-7 ${compact ? '' : 'sm:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] sm:items-end sm:gap-12'}`}>
        <div>
          <p className="eyebrow text-accent">Newsletter / New writing</p>
          <h2
            id={compact ? 'post-newsletter-heading' : 'newsletter-heading'}
            className={`${compact ? 'mt-3 text-2xl' : 'mt-4 text-3xl sm:text-4xl'} font-semibold tracking-[-0.04em] text-heading`}
          >
            The next useful note, by email.
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            No account required. Confirm once, unsubscribe in one click, and receive an email only when a new article is published.
          </p>
        </div>
        <form onSubmit={submit} className="min-w-0">
          <label htmlFor={compact ? 'post-newsletter-email' : 'newsletter-email'} className="eyebrow text-muted">
            Email address
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={compact ? 'post-newsletter-email' : 'newsletter-email'}
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={state.status === 'submitting'}
              placeholder="you@example.com"
              className="min-w-0 flex-1 border border-border bg-bg px-4 py-3 text-sm text-heading placeholder:text-muted focus:border-accent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={state.status === 'submitting'}
              className="bg-heading px-5 py-3 text-sm font-medium whitespace-nowrap text-bg transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-60"
            >
              {state.status === 'submitting' ? 'Sending…' : 'Subscribe →'}
            </button>
          </div>
          <p
            aria-live="polite"
            className={`mt-3 min-h-5 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : state.status === 'success' ? 'text-heading' : 'text-muted'}`}
          >
            {state.message || 'A confirmation link will be sent to this address.'}
          </p>
        </form>
      </div>
    </section>
  )
}

export default NewsletterSignup
