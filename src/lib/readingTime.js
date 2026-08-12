// A pure utility function: same input always gives the same output, and it
// touches nothing outside itself. Easy to reason about and easy to unit-test.

// Average adult silent reading speed. A named constant beats a magic number.
const WORDS_PER_MINUTE = 200

/**
 * Estimate reading time in minutes for a chunk of text.
 * @param {string} text
 * @returns {number} whole minutes, at least 1
 */
export function readingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
