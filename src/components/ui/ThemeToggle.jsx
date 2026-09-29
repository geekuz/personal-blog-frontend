import { useTheme } from '../../hooks/useTheme'

// ThemeToggle is tiny because all the logic lives in the useTheme hook. The
// component just reads the current theme and calls toggleTheme on click. That
// separation — logic in a hook, presentation in the component — is the whole
// point of custom hooks.
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid size-8 place-items-center rounded-md border border-border text-muted transition-colors hover:border-border-strong hover:text-heading"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
    </svg>
  )
}

export default ThemeToggle
