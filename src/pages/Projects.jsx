import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const PROJECTS = [
  {
    number: '01',
    title: 'otabek.dev',
    eyebrow: 'Publishing platform',
    description:
      'A full-stack writing platform with Markdown publishing, full-text search, comments, newsletters, scheduled posts, and a private admin workspace.',
    stack: ['React 19', 'Spring Boot', 'PostgreSQL', 'Vercel'],
    accent: 'Web / Full stack',
    caseStudy: '/projects/otabek-dev',
    links: [
      { label: 'Visit site', href: 'https://otabek.dev' },
      { label: 'Frontend', href: 'https://github.com/geekuz/personal-blog-frontend' },
      { label: 'Backend', href: 'https://github.com/geekuz/personal-blog-backend' },
    ],
  },
  {
    number: '02',
    title: 'Java HTTP Load Balancer',
    eyebrow: 'Systems engineering',
    description:
      'A framework-free HTTP load balancer built on Java 21 sockets, with concurrent request forwarding, round-robin scheduling, and automatic health checks.',
    stack: ['Java 21', 'Sockets', 'Concurrency', 'JUnit'],
    accent: 'Infrastructure / Java',
    links: [
      { label: 'View source', href: 'https://github.com/geekuz/BYO-load-balancer' },
    ],
  },
  {
    number: '03',
    title: 'Build Your Own Sort',
    eyebrow: 'Algorithms',
    description:
      'A Unix-style sort command implemented in Java, with multiple hand-built sorting algorithms, standard-input support, deduplication, and a 40-test suite.',
    stack: ['Java 21', 'Algorithms', 'CLI', 'CI'],
    accent: 'Tooling / Algorithms',
    links: [
      { label: 'View source', href: 'https://github.com/geekuz/BYO-sort-tool' },
    ],
  },
  {
    number: '04',
    title: 'Huffman Compression Tool',
    eyebrow: 'Data structures',
    description:
      'A command-line file compressor and decompressor built around Huffman coding, including frequency analysis, binary round trips, and test coverage.',
    stack: ['Java 21', 'Huffman coding', 'CLI', 'Maven'],
    accent: 'Compression / Java',
    links: [
      { label: 'View source', href: 'https://github.com/geekuz/BYO-compression-tool' },
    ],
  },
]

function ProjectVisual({ project }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex min-h-52 flex-col justify-between overflow-hidden border border-border bg-surface p-6 sm:min-h-64 sm:p-8"
    >
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="eyebrow text-muted">Project / {project.number}</span>
        <span className="size-2 bg-accent" />
      </div>
      <div className="relative">
        <p className="font-mono text-[11px] tracking-wide text-muted">{project.accent}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-heading sm:text-3xl">
          {project.title}
        </p>
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="grid gap-6 border-t border-border py-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-10 sm:py-12">
      <ProjectVisual project={project} />
      <div className="flex flex-col justify-center">
        <p className="eyebrow text-accent">{project.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
          {project.title}
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {project.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
          {project.stack.map((item) => <li key={item}>#{item.replaceAll(' ', '-').toLowerCase()}</li>)}
        </ul>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
          {project.caseStudy && (
            <Link
              to={project.caseStudy}
              className="group inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-heading"
            >
              Read case study
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          )}
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-heading transition-colors hover:text-accent"
            >
              {link.label}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px">↗</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function Projects() {
  useDocumentMeta({
    title: 'Projects — otabek.dev',
    description: 'Selected full-stack, Java, infrastructure, and algorithms projects by Otabek.',
  })

  return (
    <div>
      <header className="relative -mx-6 overflow-hidden border-b border-border px-6 pb-14 sm:pb-18">
        <div className="grid-texture pointer-events-none absolute inset-0" />
        <div className="relative max-w-3xl">
          <p className="eyebrow text-accent">Selected work / 2025—26</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-heading sm:text-7xl">
            Projects
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Full-stack products and small systems built to understand how software works beneath the abstractions.
          </p>
        </div>
      </header>

      <section aria-label="Selected projects">
        {PROJECTS.map((project) => <ProjectCard key={project.title} project={project} />)}
      </section>

      <footer className="border-t border-border pt-10 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-muted">More experiments</p>
          <p className="mt-2 text-lg font-medium text-heading">The rest live on GitHub.</p>
        </div>
        <a
          href="https://github.com/geekuz?tab=repositories"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-3 bg-heading px-5 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent sm:mt-0"
        >
          Browse all repositories <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  )
}

export default Projects
