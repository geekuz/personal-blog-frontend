import { useDocumentMeta } from '../hooks/useDocumentMeta'

// About is a static page — no data, no state, just content. Every site needs a
// few of these, and they're the simplest possible "page": a component returning
// some JSX that the router shows at a specific URL.
const STACK = ['React', 'Vite', 'React Router', 'Tailwind CSS']

function About() {
  useDocumentMeta({
    title: 'About — otabek.dev',
    description: 'About Otabek and the tools used to build this personal blog.',
  })
  return (
    <article className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Colophon</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-heading sm:text-6xl">
        About
      </h1>
      <div className="prose prose-zinc mt-8 max-w-none text-lg leading-relaxed dark:prose-invert">
        <p>
          Hi, I'm Otabek. I'm learning React by building this blog in public. Each
          post documents something I figured out while making this very site work.
        </p>
        <p>
          The interface is built with React, Vite, React Router, and Tailwind CSS.
          Posts are written in Markdown and published through a Spring Boot API.
        </p>
      </div>
      <dl className="mt-12 grid grid-cols-2 border-t border-border sm:grid-cols-4">
        {STACK.map((item, index) => (
          <div key={item} className="border-b border-border py-5 pr-4 sm:border-b-0">
            <dt className="eyebrow text-muted">{String(index + 1).padStart(2, '0')}</dt>
            <dd className="mt-2 text-sm font-medium text-heading">{item}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

export default About
