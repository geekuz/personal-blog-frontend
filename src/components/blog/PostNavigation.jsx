import { Link } from 'react-router-dom'

// End-of-post navigation. The API orders neighbours like the home page list:
// `previousPost` is the next-older post and `nextPost` the next-newer one.
// Every field is optional so the page still renders against an older API.
function PostNavigation({ previousPost, nextPost, relatedPosts }) {
  const related = relatedPosts ?? []
  const hasNeighbours = Boolean(previousPost || nextPost)
  if (!hasNeighbours && related.length === 0) return null

  return (
    <div className="mt-12 space-y-10 border-t border-border pt-8">
      {hasNeighbours && (
        <nav aria-label="Older and newer posts" className="grid gap-4 sm:grid-cols-2">
          {previousPost && (
            <NeighbourLink post={previousPost} label="← Older post" />
          )}
          {nextPost && (
            <NeighbourLink
              post={nextPost}
              label="Newer post →"
              className="sm:col-start-2 sm:text-right"
            />
          )}
        </nav>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-posts-heading">
          <h2 id="related-posts-heading" className="eyebrow text-muted">
            Related posts
          </h2>
          <ul className="mt-4 border-t border-border">
            {related.map((post) => (
              <li key={post.slug} className="border-b border-border py-4">
                <Link
                  to={`/blog/${post.slug}`}
                  className="font-medium tracking-tight text-heading transition-colors hover:text-accent"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{post.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function NeighbourLink({ post, label, className = '' }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block rounded-lg border border-border p-5 transition-colors hover:border-heading focus-visible:border-heading ${className}`}
    >
      <span className="eyebrow block text-muted">{label}</span>
      <span className="mt-2 block font-medium tracking-tight text-heading transition-colors group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  )
}

export default PostNavigation
