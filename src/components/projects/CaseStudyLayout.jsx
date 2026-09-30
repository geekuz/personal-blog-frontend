import { Link } from 'react-router-dom'

const LINK_STYLES = {
  accent: 'bg-accent text-white hover:bg-heading',
  solid: 'bg-heading text-bg hover:bg-accent',
  outline: 'border border-border text-heading hover:border-heading',
}

function ActionLink({ link }) {
  const className = `px-4 py-3 text-sm font-medium transition-colors ${LINK_STYLES[link.variant ?? 'outline']}`

  if (link.to) {
    return <Link to={link.to} className={className}>{link.label}</Link>
  }

  return (
    <a href={link.href} target="_blank" rel="noreferrer" className={className}>
      {link.label}
    </a>
  )
}

function CaseStudyLayout({ eyebrow, title, description, stats, contents, footer, children }) {
  return (
    <article className="mx-auto max-w-4xl">
      <Link
        to="/projects"
        className="eyebrow group inline-flex items-center gap-2 text-muted transition-colors hover:text-heading"
      >
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
        All projects
      </Link>

      <header className="relative mt-8 overflow-hidden border-b border-border pb-12 sm:pb-16">
        <div className="grid-texture pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="eyebrow text-accent">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.055em] text-heading sm:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{description}</p>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
        {stats.map(([term, detail]) => (
          <div key={term} className="border-b border-border py-5 pr-4 last:border-b-0 sm:border-b-0">
            <dt className="eyebrow text-muted">{term}</dt>
            <dd className="mt-2 text-sm font-medium text-heading">{detail}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Case study contents" className="my-10 border-l-2 border-heading pl-5">
        <p className="eyebrow text-muted">In this case study</p>
        <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {contents.map(([label, href]) => (
            <li key={href}><a className="text-heading transition-colors hover:text-accent" href={href}>{label}</a></li>
          ))}
        </ol>
      </nav>

      {children}

      <footer className="py-12 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted">{footer.eyebrow}</p>
          <p className="mt-3 max-w-md text-xl font-medium tracking-tight text-heading">{footer.text}</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3 sm:mt-0">
          {footer.links.map((link) => <ActionLink key={link.to ?? link.href} link={link} />)}
        </div>
      </footer>
    </article>
  )
}

export default CaseStudyLayout
