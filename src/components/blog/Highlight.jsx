import { Fragment } from 'react'
import { highlightSegments } from '../../lib/highlight'

// Renders text with search matches wrapped in <mark>. React escapes every
// segment, so API text is never interpreted as HTML.
function Highlight({ text, terms }) {
  return highlightSegments(text, terms).map((segment, index) =>
    segment.match ? (
      <mark key={index} className="rounded bg-accent-soft px-0.5 text-heading">
        {segment.text}
      </mark>
    ) : (
      <Fragment key={index}>{segment.text}</Fragment>
    ),
  )
}

export default Highlight
