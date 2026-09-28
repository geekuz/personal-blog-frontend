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
          <h2 id="related-posts-heading" className="text-lg font-semibold text-heading">
            Related posts
          </h2>
          <ul className="mt-4 space-y-4">
            {related.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="font-medium text-heading hover:text-accent"
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
      className={`group block rounded-xl border border-border p-4 transition-colors hover:border-accent focus-visible:border-accent ${className}`}
    >
      <span className="block text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="mt-1 block font-medium text-heading group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  )
}

export default PostNavigation
