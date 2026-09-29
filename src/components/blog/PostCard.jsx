import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/formatDate'
import { parseSearchTerms } from '../../lib/highlight'
import CoverImage from './CoverImage'
import Highlight from './Highlight'

// PostCard receives one `post` object via props and renders a summary row.
// It computes the date label and reading time from the post — derived values,
// recalculated on render rather than stored on the post itself.
//
// The title uses a router <Link> so clicking it navigates to the post page
// without a full page reload. Its ::after overlay stretches over the whole row,
// so the entire row is clickable while there is still only one link.
//
// Search results carry a `snippet` of the body around the first match; it
// replaces the summary so readers see why the post matched `query`.
function PostCard({ post, query = '' }) {
  return (
    <article className="group relative grid gap-x-10 gap-y-4 border-b border-border py-8 sm:grid-cols-[10.5rem_minmax(0,1fr)_auto]">
      <div className="eyebrow flex gap-2 pt-1.5 text-muted sm:flex-col sm:gap-1.5">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true" className="sm:hidden">·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>

      <div className="min-w-0">
        <h2 className="text-xl font-semibold leading-snug tracking-tight text-heading sm:text-2xl">
          <Link
            to={`/blog/${post.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent"
          >
            {post.title}
            <span
              aria-hidden="true"
              className="ml-2 inline-block text-muted opacity-0 transition duration-300 ease-(--ease-out-expo) group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100"
            >
              →
            </span>
          </Link>
        </h2>

        {post.snippet ? (
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">
            <Highlight text={post.snippet} terms={parseSearchTerms(query)} />
          </p>
        ) : (
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">{post.summary}</p>
        )}

        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
            {post.tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        )}
      </div>

      <CoverImage
        src={post.coverImageUrl}
        alt={post.coverImageAlt}
        className="order-first aspect-video w-full rounded-md border border-border object-cover transition duration-500 ease-(--ease-out-expo) group-hover:scale-[1.02] sm:order-none sm:aspect-[4/3] sm:w-44"
      />
    </article>
  )
}

export default PostCard
