import { useDocumentMeta } from '../hooks/useDocumentMeta'

const CHANNELS = [
  {
    label: 'Telegram',
    value: '@creative_otabek',
    note: 'Best for a direct conversation.',
    href: 'https://t.me/creative_otabek',
  },
  {
    label: 'GitHub',
    value: '@geekuz',
    note: 'Code, experiments and ongoing work.',
    href: 'https://github.com/geekuz',
  },
]

const FOCUS = [
  ['Java backend systems', 'Spring Boot APIs, authentication, persistence, migrations and integrations.'],
  ['Full-stack products', 'React interfaces backed by clear, secure server-side boundaries.'],
  ['Engineering fundamentals', 'Small systems built from first principles to understand the machinery underneath.'],
]

function Contact() {
  useDocumentMeta({
    title: 'Contact — otabek.dev',
    description: 'Contact Otabek and download his Java and full-stack engineering résumé.',
  })

  return (
    <div>
      <header className="relative -mx-6 overflow-hidden border-b border-border px-6 pb-14 sm:pb-18">
        <div className="grid-texture pointer-events-none absolute inset-0" />
        <div className="relative max-w-3xl">
          <p className="eyebrow text-accent">Contact / Direct channels</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-heading sm:text-7xl">
            Let&apos;s talk.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Have a useful product, a difficult engineering problem, or simply want to compare notes? Reach me directly.
          </p>
        </div>
      </header>

      <section aria-labelledby="channels-heading" className="grid gap-8 border-b border-border py-12 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-14 sm:py-16">
        <div>
          <p className="eyebrow text-accent">01 / Channels</p>
          <h2 id="channels-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">
            No forms. No queue.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
            These are the only public contact profiles currently attached to this site.
          </p>
        </div>
        <div className="border-t border-border">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-3 border-b border-border py-7 transition-colors hover:text-accent sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <span className="eyebrow text-muted">{channel.label}</span>
              <span>
                <span className="block text-lg font-semibold text-heading transition-colors group-hover:text-accent">{channel.value}</span>
                <span className="mt-1 block text-sm text-muted">{channel.note}</span>
              </span>
              <span aria-hidden="true" className="hidden text-heading transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-1 group-hover:text-accent sm:block">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="resume-heading" className="grid gap-8 border-b border-border py-12 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] sm:gap-14 sm:py-16">
        <div className="relative min-h-72 overflow-hidden border border-border bg-surface p-7 sm:p-9">
          <div className="grid-texture pointer-events-none absolute inset-0" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <span className="eyebrow text-muted">Document / PDF</span>
              <span className="size-2 bg-accent" />
            </div>
            <div>
              <p className="font-mono text-[11px] text-muted">Otabek</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-heading">Engineering résumé</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">Java, Spring Boot, React, PostgreSQL and selected public engineering work.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow text-accent">02 / Résumé</p>
          <h2 id="resume-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">One page. Just the evidence.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            A concise engineering profile built only from verified public projects and technologies—without invented employment, education or performance claims.
          </p>
          <a
            href="/otabek-resume.pdf"
            download="Otabek-Resume.pdf"
            className="mt-7 inline-flex w-fit items-center gap-3 bg-heading px-5 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent"
          >
            Download résumé <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="focus-heading" className="py-12 sm:py-16">
        <p className="eyebrow text-accent">03 / Focus</p>
        <h2 id="focus-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-heading">What I work on</h2>
        <div className="mt-8 border-t border-border">
          {FOCUS.map(([title, body], index) => (
            <div key={title} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[4rem_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8">
              <span className="eyebrow text-muted">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-lg font-semibold text-heading">{title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Contact
