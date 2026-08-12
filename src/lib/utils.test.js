import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'
import { readingTime } from './readingTime'

describe('readingTime', () => {
  it('returns at least one minute', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime('a short post')).toBe(1)
  })

  it('rounds using 200 words per minute', () => {
    expect(readingTime(Array(300).fill('word').join(' '))).toBe(2)
  })
})

describe('formatDate', () => {
  it('formats ISO dates and safely handles invalid values', () => {
    expect(formatDate('2026-06-23T12:00:00Z')).toBe('June 23, 2026')
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(formatDate('')).toBe('')
  })
})
