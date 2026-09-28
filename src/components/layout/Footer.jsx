// Footer demonstrates a prop with a default value. `year` defaults to the
// current year, but a parent could pass a different one. Default values keep
// components flexible without forcing every caller to supply every prop.
function Footer({ year = new Date().getFullYear() }) {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-muted">
        <p>
          © {year} Otabek. Built with React + Vite while learning. All rights
          reserved.
        </p>
        {/* A plain <a>, not a router <Link>: the feed is served by the backend, not the SPA. */}
        <p className="mt-2">
          <a
            href="/feed.xml"
            className="underline underline-offset-4 hover:text-accent"
          >
            RSS feed
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
