import { useState, useEffect } from 'react'

// A CUSTOM HOOK is a reusable function that uses other hooks. By convention its
// name starts with "use". This one behaves like useState, but it also persists
// the value to localStorage so it survives a page reload.
//
//   const [value, setValue] = useLocalStorage('theme', 'light')
//
// How it works:
//  - useState's initializer runs once. We pass it a FUNCTION so the localStorage
//    read happens lazily on first render only (this is "lazy initial state").
//  - A useEffect re-saves to localStorage whenever the key or value changes.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      // localStorage can throw (private mode, quota). Fall back gracefully.
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures — the app still works, it just won't persist.
    }
  }, [key, value])

  return [value, setValue]
}
