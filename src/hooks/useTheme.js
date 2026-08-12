import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Decide the very first theme: use the saved choice if there is one, otherwise
// follow the operating system's preference. Wrapped so it's safe during SSR/
// tests where matchMedia may not exist.
function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

// useTheme builds on useLocalStorage: it remembers the user's choice AND applies
// it to the page. The effect is the "side effect" — it syncs React state to the
// outside world by toggling the `dark` class on <html>, which our CSS tokens key
// off of. Returns the current theme plus a toggle function.
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme', getSystemPreference())

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
