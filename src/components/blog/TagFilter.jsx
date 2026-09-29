// TagFilter renders a row of buttons: "All" plus one per tag. Like SearchBar it
// owns no state — the parent tells it which tag is active and gives it an
// onSelect callback. Clicking a button calls onSelect with that tag (or null for
// "All"), and the parent updates its state.
//
// aria-pressed tells screen readers which toggle button is currently active.
function TagFilter({ tags, activeTag, onSelect }) {
  const baseClass =
    'h-8 rounded-md border px-3 font-mono text-[11px] tracking-wide transition-colors'
  const activeClass = 'border-heading bg-heading text-bg'
  const idleClass = 'border-border text-muted hover:border-border-strong hover:text-heading'

  function buttonClass(isActive) {
    return `${baseClass} ${isActive ? activeClass : idleClass}`
  }

  return (
    <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeTag === null}
        className={buttonClass(activeTag === null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          aria-pressed={activeTag === tag}
          className={buttonClass(activeTag === tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

export default TagFilter
