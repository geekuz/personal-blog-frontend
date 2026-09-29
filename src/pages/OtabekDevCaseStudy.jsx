import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const CAPABILITIES = [
  ['Publish', 'Markdown editing, autosaved drafts, cover media, scheduling, tags and related-post navigation.'],
  ['Discover', 'Full-text search, snippets, RSS, sitemap, social previews and browser-friendly URLs.'],
  ['Engage', 'Verified accounts, comments and opt-in email notifications for new articles.'],
  ['Operate', 'Role-gated admin tools, media reuse, delivery status and production health checks.'],
]

const DECISIONS = [
  {
    number: '01',
    title: 'Server sessions over browser-stored tokens',
    body: 'Spring Security owns authentication through an HTTP-only session cookie. Mutations require CSRF protection, while JDBC-backed sessions survive application restarts. This adds cross-origin cookie configuration, but keeps credentials out of browser JavaScript.',
  },
  {
    number: '02',
    title: 'Markdown source with structured metadata',
    body: 'Article bodies stay portable and pleasant to write, while PostgreSQL stores searchable titles, summaries, tags, status, scheduling and navigation data. The React renderer adds code highlighting, heading links and a table of contents.',
  },
  {
    number: '03',
    title: 'A split deployment with a narrow boundary',
    body: 'Vercel serves the static React application and rewrites discovery documents to the API. Render runs Spring Boot. The browser crosses that boundary only through a small API client that handles credentials, errors and request cancellation consistently.',
  },
  {
    number: '04',
    title: 'Forward-only database evolution',
    body: 'Flyway owns the schema and Hibernate validates it instead of modifying it. Thirteen immutable migrations record the path from basic posts to accounts, comments, newsletters, scheduled publishing and the media catalog.',
  },
]

function OtabekDevCaseStudy() {
  useDocumentMeta({
    title: 'Building otabek.dev — Case study',
    description: 'How Otabek built and deployed a full-stack publishing platform with React, Spring Boot and PostgreSQL.',
  })

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
          <p className="eyebrow text-accent">Case study / 01</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.055em] text-heading sm:text-7xl">
            Building otabek.dev
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Turning a small React learning project into a production publishing system with secure accounts, editorial tooling and a Java backend.
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
        {[
          ['Role', 'Design + engineering'],
          ['Frontend', 'React 19'],
          ['Backend', 'Spring Boot'],
          ['Status', 'Live'],
        ].map(([term, detail]) => (
          <div key={term} className="border-b border-border py-5 pr-4 last:border-b-0 sm:border-b-0">
            <dt className="eyebrow text-muted">{term}</dt>
            <dd className="mt-2 text-sm font-medium text-heading">{detail}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Case study contents" className="my-10 border-l-2 border-heading pl-5">
        <p className="eyebrow text-muted">In this case study</p>
        <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {[
            ['Challenge', '#challenge'],
            ['Architecture', '#architecture'],
            ['Capabilities', '#capabilities'],
            ['Decisions', '#decisions'],
            ['Delivery', '#delivery'],
          ].map(([label, href]) => (
            <li key={href}><a className="text-heading transition-colors hover:text-accent" href={href}>{label}</a></li>
          ))}
        </ol>
      </nav>

      <section id="challenge" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">01 / Challenge</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-12">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Beyond a static blog</h2>
          <div className="space-y-5 text-[16px] leading-relaxed text-muted">
            <p>
              The first version proved the reading experience, but content still behaved like source code: publishing meant editing files and redeploying the site. There were no durable accounts, editorial workflow or reader features.
            </p>
            <p>
              The goal became a small but credible publishing product—easy to operate alone, secure enough for public accounts, and explicit enough to remain a learning project rather than a black box of services.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="scroll-mt-20 border-t border-border py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">02 / Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">A deliberately small system</h2>
          </div>
          <span className="eyebrow hidden text-muted sm:block">Production topology</span>
        </div>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
          The React application is independently deployable, while Spring Boot owns business rules and persistence. Managed storage and email services stay behind the API boundary.
        </p>
        <iframe
          title="otabek.dev production architecture"
          src="/diagrams/otabek-dev-architecture.html"
          className="mt-8 h-[34rem] w-full border border-border bg-surface sm:h-[31rem]"
        />
      </section>

      <section id="capabilities" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">03 / Capabilities</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">One product, four workflows</h2>
        <div className="mt-8 grid border-t border-border sm:grid-cols-2">
          {CAPABILITIES.map(([title, body], index) => (
            <div key={title} className="border-b border-border py-7 sm:odd:pr-8 sm:even:border-l sm:even:pl-8">
              <p className="eyebrow text-muted">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-heading">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="decisions" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">04 / Decisions</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">Trade-offs made explicit</h2>
        <div className="mt-8">
          {DECISIONS.map((decision) => (
            <div key={decision.number} className="grid gap-3 border-t border-border py-7 sm:grid-cols-[4rem_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8">
              <span className="eyebrow text-muted">{decision.number}</span>
              <h3 className="text-lg font-semibold leading-snug text-heading">{decision.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{decision.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="delivery" className="scroll-mt-20 border-y border-border py-12">
        <p className="eyebrow text-accent">05 / Delivery</p>
        <div className="mt-5 grid gap-8 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-12">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">Evidence before claims</h2>
          <div>
            <p className="text-[16px] leading-relaxed text-muted">
              The repositories test behavior at the component, API and integration levels. Production releases also receive direct-route, mobile-layout, health-endpoint and representative public-flow checks.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-heading">
              {[
                'React component tests with Vitest, Testing Library and MSW',
                'Spring integration tests across auth, publishing, comments and discovery',
                'Flyway validation from an empty schema and upgrade paths',
                'Browser smoke checks for direct routes, responsive layout and console errors',
              ].map((item) => (
                <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-accent" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="py-12 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-muted">Explore the build</p>
          <p className="mt-3 max-w-md text-xl font-medium tracking-tight text-heading">The product is live and both codebases are public.</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3 sm:mt-0">
          <Link to="/contact" className="bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-heading">Contact →</Link>
          <a href="https://otabek.dev" className="bg-heading px-4 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent">Visit site ↗</a>
          <a href="https://github.com/geekuz/personal-blog-frontend" target="_blank" rel="noreferrer" className="border border-border px-4 py-3 text-sm font-medium text-heading transition-colors hover:border-heading">Frontend ↗</a>
          <a href="https://github.com/geekuz/personal-blog-backend" target="_blank" rel="noreferrer" className="border border-border px-4 py-3 text-sm font-medium text-heading transition-colors hover:border-heading">Backend ↗</a>
        </div>
      </footer>
    </article>
  )
}

export default OtabekDevCaseStudy
