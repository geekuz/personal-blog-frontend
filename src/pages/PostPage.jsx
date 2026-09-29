import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NotFound from './NotFound'
import StatusMessage from '../components/ui/StatusMessage'
import { getPostBySlug } from '../api/posts'
import { formatDate } from '../lib/formatDate'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import Comments from '../components/blog/Comments'
import MarkdownContent from '../components/blog/MarkdownContent'
import CoverImage from '../components/blog/CoverImage'
import PostNavigation from '../components/blog/PostNavigation'

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
    <article className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="eyebrow group inline-flex items-center gap-2 text-muted transition-colors hover:text-heading"
      >
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
        All posts
      </Link>
      <header className="mt-8 mb-10 border-b border-border pb-8">
        <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance text-heading sm:text-5xl">
          {post.title}
        </h1>
        {post.summary && (
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.summary}</p>
        )}
        <div className="eyebrow mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
          <span>{post.readingTimeMinutes} min read</span>
          {post.tags?.length > 0 && (
            <>
              <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
              <span className="normal-case tracking-normal">
                {post.tags.map((tag) => `#${tag}`).join('  ')}
              </span>
            </>
          )}
        </div>
      </header>
      <CoverImage src={post.coverImageUrl} alt={post.coverImageAlt} className="mb-10 aspect-video w-full rounded-lg border border-border object-cover" />
      <MarkdownContent tableOfContents>{post.content}</MarkdownContent>
      <PostNavigation
        previousPost={post.previousPost}
        nextPost={post.nextPost}
        relatedPosts={post.relatedPosts}
      />
      <Comments slug={slug} />
    </article>
  )
}

export default PostPage
