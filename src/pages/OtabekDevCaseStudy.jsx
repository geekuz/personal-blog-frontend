import CaseStudyLayout from '../components/projects/CaseStudyLayout'
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
    body: 'Flyway owns the schema and Hibernate validates it instead of modifying it. Fourteen immutable migrations record the path from basic posts to accounts, comments, newsletters, scheduled publishing and the media catalog.',
  },
]

const DEVELOPMENT_HISTORY = [
  {
    date: '12 August 2026',
    title: 'Start with the reading experience',
    body: 'The first version was a React and Vite site with Markdown articles stored beside the frontend. It established the routes, article rendering, tags, search controls and responsive shell before a server existed.',
  },
  {
    date: '13 August 2026',
    title: 'Move content behind a Java API',
    body: 'A Spring Boot service took ownership of posts and tags, PostgreSQL became the source of truth, and Flyway imported the original Markdown through forward-only migrations. The React app switched from bundled files to paginated API requests.',
  },
  {
    date: '17–18 August 2026',
    title: 'Build identity as a complete flow',
    body: 'Registration and login arrived with BCrypt passwords, role-based access, JDBC-backed sessions and CSRF protection. Email verification through Resend, password recovery, single-use hashed tokens and abuse rate limits completed the account lifecycle.',
  },
  {
    date: '20–21 August 2026',
    title: 'Add reader participation and publishing control',
    body: 'Verified readers gained newsletter preferences and comments. On the other side, the first role-gated admin dashboard made it possible to create, edit and publish articles, then track newsletter delivery without touching the database.',
  },
  {
    date: '24–27 August 2026',
    title: 'Turn the dashboard into an editorial workspace',
    body: 'Markdown preview, cover images, automatic draft saving, scheduled publishing and image uploads were added in small increments. Each frontend change landed with its matching API and migration rather than as one large rewrite.',
  },
  {
    date: '28 September 2026',
    title: 'Harden media and discovery',
    body: 'Uploaded files moved to Cloudflare R2 and became reusable media assets. The reading view gained code-focused polish and related navigation, while RSS, the sitemap and bot-specific social-preview pages made published work discoverable outside the app.',
  },
  {
    date: '29 September 2026 · morning',
    title: 'Improve finding and measuring content',
    body: 'Search expanded from metadata to ranked full-text matching with highlighted snippets. The site moved to otabek.dev, gained safe analytics that exclude private routes, and kept the API boundary hidden behind stable public URLs.',
  },
  {
    date: '29 September 2026 · afternoon',
    title: 'Evolve the blog into an engineering portfolio',
    body: 'A sharp editorial redesign established the current visual system. Projects, this case study, a responsive architecture diagram, the Contact hub and a factual downloadable résumé gave the work context beyond individual articles.',
  },
  {
    date: '29 September 2026 · evening',
    title: 'Remove friction from subscribing',
    body: 'Newsletter signup became available without an account, but only confirmed addresses can receive mail. Hashed, short-lived confirmation and unsubscribe tokens, CSRF checks and rate limits preserve the security model introduced earlier.',
  },
]

function OtabekDevCaseStudy() {
  useDocumentMeta({
    title: 'Building otabek.dev — Case study',
    description: 'How Otabek built and deployed a full-stack publishing platform with React, Spring Boot and PostgreSQL.',
  })

  return (
    <CaseStudyLayout
      eyebrow="Case study / 01"
      title="Building otabek.dev"
      description="Turning a small React learning project into a production publishing system with secure accounts, editorial tooling and a Java backend."
      stats={[
          ['Role', 'Design + engineering'],
          ['Frontend', 'React 19'],
          ['Backend', 'Spring Boot'],
          ['Status', 'Live'],
      ]}
      contents={[
            ['Challenge', '#challenge'],
            ['Architecture', '#architecture'],
            ['History', '#history'],
            ['Capabilities', '#capabilities'],
            ['Decisions', '#decisions'],
            ['Delivery', '#delivery'],
      ]}
      footer={{
        eyebrow: 'Explore the build',
        text: 'The product is live and both codebases are public.',
        links: [
          { label: 'Contact →', to: '/contact', variant: 'accent' },
          { label: 'Visit site ↗', href: 'https://otabek.dev', variant: 'solid' },
          { label: 'Frontend ↗', href: 'https://github.com/geekuz/personal-blog-frontend' },
          { label: 'Backend ↗', href: 'https://github.com/geekuz/personal-blog-backend' },
        ],
      }}
    >

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

      <section id="history" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">03 / Development history</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-heading">From files to a full publishing system</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              A commit-backed timeline of how the product grew. The dates and sequence come from the public frontend and backend repositories.
            </p>
          </div>
          <ol className="border-t border-border">
            {DEVELOPMENT_HISTORY.map((milestone, index) => (
              <li key={milestone.date} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6">
                <span className="eyebrow text-muted">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <time className="eyebrow text-accent">{milestone.date}</time>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-heading">{milestone.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{milestone.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="capabilities" className="scroll-mt-20 border-t border-border py-12">
        <p className="eyebrow text-accent">04 / Capabilities</p>
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
        <p className="eyebrow text-accent">05 / Decisions</p>
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
        <p className="eyebrow text-accent">06 / Delivery</p>
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

    </CaseStudyLayout>
  )
}

export default OtabekDevCaseStudy
