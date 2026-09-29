// SearchBar is a CONTROLLED input. It doesn't own any state itself: the current
// text comes in as `value`, and every keystroke calls `onChange` to push the new
// text back up to the parent. React stays the single source of truth — the input
// only ever shows what the parent's state says it should.
//
// This is the "controlled component" pattern: value + onChange working together.
//
// The API rejects queries longer than 200 characters, so the input stops there.
const MAX_QUERY_LENGTH = 200

function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={MAX_QUERY_LENGTH}
      placeholder="Search posts…"
      aria-label="Search posts"
      className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent"
    />
  )
}

export default SearchBar
