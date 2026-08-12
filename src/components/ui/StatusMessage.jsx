function StatusMessage({ title, children, actionLabel, onAction }) {
  return (
    <section
      role={onAction ? 'alert' : 'status'}
      className="rounded-xl border border-border bg-surface p-6 text-center"
    >
      <h2 className="text-lg font-semibold text-heading">{title}</h2>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {actionLabel}
        </button>
      )}
    </section>
  )
}

export default StatusMessage
