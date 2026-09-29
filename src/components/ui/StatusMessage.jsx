function StatusMessage({ title, children, actionLabel, onAction }) {
  return (
    <section
      role={onAction ? 'alert' : 'status'}
      className="my-8 rounded-lg border border-dashed border-border-strong px-6 py-14 text-center"
    >
      <h2 className="text-base font-semibold tracking-tight text-heading">{title}</h2>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 h-9 rounded-md bg-heading px-4 text-[13px] font-medium text-bg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {actionLabel}
        </button>
      )}
    </section>
  )
}

export default StatusMessage
