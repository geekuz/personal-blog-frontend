import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmPublicSubscription, unsubscribePublicSubscription } from '../api/newsletter'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ACTIONS = {
  confirm: {
    eyebrow: 'Newsletter / Confirmation',
    title: 'Confirm your subscription.',
    body: 'Activate this address to receive new articles from otabek.dev.',
    button: 'Confirm subscription',
    pending: 'Confirming…',
    success: 'Your subscription is confirmed.',
    action: confirmPublicSubscription,
  },
  unsubscribe: {
    eyebrow: 'Newsletter / Unsubscribe',
    title: 'Leave the newsletter.',
    body: 'This removes the address linked to this email. You can subscribe again at any time.',
    button: 'Unsubscribe',
    pending: 'Unsubscribing…',
    success: 'You have been unsubscribed.',
    action: unsubscribePublicSubscription,
  },
}

function NewsletterAction({ type }) {
  const details = ACTIONS[type]
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, setState] = useState({ status: 'idle', message: '' })

  useDocumentMeta({
    title: `${type === 'confirm' ? 'Confirm newsletter' : 'Unsubscribe'} — otabek.dev`,
    description: 'Manage an otabek.dev newsletter subscription.',
    robots: 'noindex,nofollow',
  })

  async function submit() {
    if (!token || state.status === 'submitting') return
    setState({ status: 'submitting', message: '' })
    try {
      const response = await details.action(token)
      setState({ status: 'success', message: response.message || details.success })
    } catch (error) {
      setState({ status: 'error', message: error.message ?? 'This newsletter link could not be used.' })
    }
  }

  const missingToken = !token
  const finished = state.status === 'success'

  return (
    <div className="mx-auto max-w-2xl py-8 sm:py-16">
      <p className="eyebrow text-accent">{details.eyebrow}</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-heading sm:text-6xl">
        {finished ? state.message : details.title}
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        {finished ? 'The change is complete.' : missingToken ? 'This link is missing its secure token.' : details.body}
      </p>
      {!finished && !missingToken && (
        <button
          type="button"
          onClick={submit}
          disabled={state.status === 'submitting'}
          className="mt-8 bg-heading px-5 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-60"
        >
          {state.status === 'submitting' ? details.pending : details.button}
        </button>
      )}
      {state.status === 'error' && (
        <p role="alert" className="mt-5 text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <div className="mt-10 border-t border-border pt-6">
        <Link to="/" className="text-sm font-medium text-heading transition-colors hover:text-accent">← Return to writing</Link>
      </div>
    </div>
  )
}

export default NewsletterAction
