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
    <div className="py-16 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold text-heading">Page not found</h1>
      <p className="mt-3 text-muted">
        That page doesn't exist — it may have moved or never existed.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </div>
  )
}

export default NotFound
