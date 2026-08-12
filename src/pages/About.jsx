// About is a static page — no data, no state, just content. Every site needs a
// few of these, and they're the simplest possible "page": a component returning
// some JSX that the router shows at a specific URL.
function About() {
  useDocumentMeta({
    title: 'About — otabek.dev',
    description: 'About Otabek and the tools used to build this personal blog.',
  })
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <h1>About</h1>
      <p>
        Hi, I'm Otabek. I'm learning React by building this blog in public. Each
        post documents something I figured out while making this very site work.
      </p>
      <p>
        The stack is intentionally small: React, Vite, React Router, and Tailwind
        CSS. Posts are plain Markdown files in the repo.
      </p>
    </article>
  )
}

export default About
import { useDocumentMeta } from '../hooks/useDocumentMeta'
