// Footer demonstrates a prop with a default value. `year` defaults to the
// current year, but a parent could pass a different one. Default values keep
// components flexible without forcing every caller to supply every prop.
function Footer({ year = new Date().getFullYear() }) {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm font-medium text-heading">
            otabek<span className="text-muted">.dev</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Notes from building in public with React + Vite.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          {/* A plain <a>, not a router <Link>: the feed is served by the backend, not the SPA. */}
          <a
            href="/feed.xml"
            className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-heading"
          >
            RSS feed
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px">↗</span>
          </a>
          <p className="eyebrow text-muted">© {year} Otabek. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
