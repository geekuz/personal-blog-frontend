function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const buttonClass =
    'h-9 rounded-md border border-border px-3.5 font-mono text-xs text-heading transition-colors hover:border-heading disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:opacity-50'

  return (
    <nav aria-label="Posts pagination" className="mt-10 flex items-center justify-between">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className={buttonClass}
      >
        ← Previous
      </button>
      <span className="eyebrow text-muted">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={buttonClass}
      >
        Next →
      </button>
    </nav>
  )
}

export default Pagination
