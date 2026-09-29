import { describe, expect, it } from 'vitest'
import { highlightSegments, parseSearchTerms } from './highlight'

describe('parseSearchTerms', () => {
  it('splits words, keeps quoted phrases, lowercases and removes duplicates', () => {
    expect(parseSearchTerms('  React "Custom Hooks" react useEffect ')).toEqual([
      'react',
      'custom hooks',
      'useeffect',
    ])
  })

  it('collapses whitespace inside quoted phrases like the server does', () => {
    expect(parseSearchTerms('"custom   hooks"')).toEqual(['custom hooks'])
  })

  it('returns no terms for empty input', () => {
    expect(parseSearchTerms('')).toEqual([])
    expect(parseSearchTerms(undefined)).toEqual([])
    expect(parseSearchTerms('""')).toEqual([])
  })
})

describe('highlightSegments', () => {
  it('marks every case-insensitive occurrence and keeps the original casing', () => {
    expect(highlightSegments('useEffect runs; USEEFFECT again', ['useeffect'])).toEqual([
      { text: 'useEffect', match: true },
      { text: ' runs; ', match: false },
      { text: 'USEEFFECT', match: true },
      { text: ' again', match: false },
    ])
  })

  it('prefers the longest term when terms overlap', () => {
    expect(highlightSegments('custom hooks', ['hook', 'custom hooks'])).toEqual([
      { text: 'custom hooks', match: true },
    ])
  })

  it('treats regex characters in terms literally', () => {
    expect(highlightSegments('costs 100% (c++)', ['100%', 'c++'])).toEqual([
      { text: 'costs ', match: false },
      { text: '100%', match: true },
      { text: ' (', match: false },
      { text: 'c++', match: true },
      { text: ')', match: false },
    ])
  })

  it('returns the whole text unmarked when there is nothing to highlight', () => {
    expect(highlightSegments('plain text', [])).toEqual([{ text: 'plain text', match: false }])
  })
})
