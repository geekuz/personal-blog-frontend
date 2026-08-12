import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/formatDate'

// PostCard receives one `post` object via props and renders a summary card.
// It computes the date label and reading time from the post — derived values,
// recalculated on render rather than stored on the post itself.
//
// The title uses a router <Link> so clicking it navigates to the post page
// without a full page reload.
function PostCard({ post }) {
  return (
    <article className="group rounded-xl border border-border p-5 transition-colors hover:border-accent">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>

      <h2 className="mt-2 text-xl font-semibold text-heading">
        <Link to={`/blog/${post.slug}`} className="group-hover:text-accent">
          {post.title}
        </Link>
      </h2>

      <p className="mt-2 text-sm text-muted">{post.summary}</p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent"
          >
            #{tag}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default PostCard
