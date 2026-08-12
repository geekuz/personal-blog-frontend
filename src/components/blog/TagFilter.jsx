// TagFilter renders a row of buttons: "All" plus one per tag. Like SearchBar it
// owns no state — the parent tells it which tag is active and gives it an
// onSelect callback. Clicking a button calls onSelect with that tag (or null for
// "All"), and the parent updates its state.
//
// aria-pressed tells screen readers which toggle button is currently active.
function TagFilter({ tags, activeTag, onSelect }) {
  const baseClass =
    'rounded-full px-3 py-1 text-xs font-medium transition-colors'
  const activeClass = 'bg-accent text-white'
  const idleClass = 'bg-accent-soft text-accent hover:bg-accent hover:text-white'

  function buttonClass(isActive) {
    return `${baseClass} ${isActive ? activeClass : idleClass}`
  }

  return (
    <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
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
