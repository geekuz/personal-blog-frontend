import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import NotFound from './NotFound'
import StatusMessage from '../components/ui/StatusMessage'
import { getPostBySlug } from '../api/posts'
import { formatDate } from '../lib/formatDate'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import Comments from '../components/blog/Comments'

function PostPage() {
  const { slug } = useParams()
  const [resource, setResource] = useState(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const requestKey = `${slug}\u0000${requestVersion}`
  const currentResource = resource?.key === requestKey ? resource : null
  const post = currentResource?.post ?? null
  const error = currentResource?.error ?? null

  useDocumentMeta({
    title: post ? `${post.title} — otabek.dev` : undefined,
    description: post?.summary,
  })

  useEffect(() => {
    const controller = new AbortController()
    getPostBySlug(slug, { signal: controller.signal })
      .then((loadedPost) => {
        if (controller.signal.aborted) return
        setResource({ key: requestKey, post: loadedPost, error: null })
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setResource({ key: requestKey, post: null, error: requestError })
        }
      })

    return () => controller.abort()
  }, [slug, requestVersion, requestKey])

  if (error?.status === 404) return <NotFound />
  if (!currentResource) {
    return <StatusMessage title="Loading post…">Fetching the article.</StatusMessage>
  }
  if (error) {
    return (
      <StatusMessage
        title="This post could not be loaded"
        actionLabel="Try again"
        onAction={() => setRequestVersion((version) => version + 1)}
      >
        Check your connection and try again.
      </StatusMessage>
    )
  }

  return (
    <article>
      <Link to="/" className="text-sm text-muted hover:text-accent">
        ← All posts
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-heading sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert prose-a:text-accent">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
      <Comments slug={slug} />
    </article>
  )
}

export default PostPage
