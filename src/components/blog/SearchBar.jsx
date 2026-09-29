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
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3.5 3.5" strokeLinecap="square" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="Search posts…"
        aria-label="Search posts"
        className="h-8 w-full rounded-md border border-border bg-bg pr-3 pl-8.5 text-[13px] text-heading outline-none transition-colors placeholder:text-muted hover:border-border-strong focus:border-heading"
      />
    </div>
  )
}

export default SearchBar
