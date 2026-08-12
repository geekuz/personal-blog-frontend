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
      className="rounded-lg border border-border px-2.5 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
