import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

// NotFound is rendered by the catch-all route (path="*") for any URL that
// doesn't match. <Link> navigates back home without a full page reload.
function NotFound() {
  useDocumentMeta({
    title: 'Page not found — otabek.dev',
    description: 'The requested page could not be found.',
  })
  return (
    <div className="mx-auto max-w-3xl py-12 sm:py-20">
      <p className="eyebrow text-accent">Error 404</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-heading sm:text-7xl">
        Page not found
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
        That page doesn't exist — it may have moved or never existed.
      </p>
      <Link
        to="/"
        className="mt-10 inline-flex h-10 items-center gap-2 rounded-md bg-heading px-5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
      >
        <span aria-hidden="true">←</span> Back to home
      </Link>
    </div>
  )
}

export default NotFound
