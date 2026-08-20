import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { getComments } from '../../api/posts'
import { formatDate } from '../../lib/formatDate'

function Comments({ slug }) {
  const { user, addComment, removeComment } = useAuth()
  const [resource, setResource] = useState({ status: 'loading', items: [], message: '' })
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getComments(slug, { signal: controller.signal })
      .then(({ items }) => {
        if (!controller.signal.aborted) setResource({ status: 'ready', items, message: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'AbortError') {
          setResource({ status: 'error', items: [], message: error.message })
        }
      })
    return () => controller.abort()
  }, [slug, requestVersion])

  async function submit(event) {
    event.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    try {
      const comment = await addComment(slug, body)
      setResource((current) => ({ ...current, status: 'ready', items: [...current.items, comment] }))
      setBody('')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function remove(commentId) {
    setFormError('')
    try {
      await removeComment(commentId)
      setResource((current) => ({ ...current, items: current.items.filter((item) => item.id !== commentId) }))
    } catch (error) {
      setFormError(error.message)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-12 border-t border-border pt-8">
      <h2 id="comments-heading" className="text-2xl font-bold text-heading">Comments</h2>

      {user?.emailVerified ? (
        <form onSubmit={submit} className="mt-6">
          <label className="block text-sm font-medium text-heading" htmlFor="comment-body">Add a comment</label>
          <textarea
            id="comment-body"
            required
            maxLength="2000"
            rows="4"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-heading outline-none focus:border-accent"
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-xs text-muted">{body.length}/2000</span>
            <button disabled={isSubmitting || !body.trim()} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {isSubmitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : user ? (
        <p className="mt-5 text-sm text-muted">Verify your email from the Account page to join the discussion.</p>
      ) : (
        <p className="mt-5 text-sm text-muted"><Link to="/login" className="text-accent hover:underline">Log in</Link> with a verified account to comment.</p>
      )}

      {formError && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

      {resource.status === 'loading' && <p role="status" className="mt-8 text-sm text-muted">Loading comments…</p>}
      {resource.status === 'error' && (
        <div className="mt-8">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{resource.message}</p>
          <button onClick={() => setRequestVersion((version) => version + 1)} className="mt-3 text-sm text-accent hover:underline">Try again</button>
        </div>
      )}
      {resource.status === 'ready' && resource.items.length === 0 && (
        <p className="mt-8 text-sm text-muted">No comments yet. Start the conversation.</p>
      )}
      {resource.status === 'ready' && resource.items.length > 0 && (
        <ol className="mt-8 space-y-5">
          {resource.items.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-heading">{comment.authorDisplayName}</p>
                  <time className="text-xs text-muted" dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                </div>
                {comment.canDelete && (
                  <button onClick={() => remove(comment.id)} className="text-xs text-muted hover:text-red-600">Delete</button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-text">{comment.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Comments
