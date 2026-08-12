import { useEffect, useState } from 'react'
import SearchBar from './SearchBar'

function DebouncedSearchBar({ initialValue, onCommit, delay = 300 }) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timeout = window.setTimeout(() => onCommit(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay, onCommit])

  return <SearchBar value={value} onChange={setValue} />
}

export default DebouncedSearchBar
