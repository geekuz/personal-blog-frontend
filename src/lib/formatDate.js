/**
 * Format an ISO date string (YYYY-MM-DD) into a human-friendly label,
 * e.g. "2026-06-23" -> "June 23, 2026". Returns the raw input if it can't be
 * parsed, and an empty string for empty input — never throws.
 * @param {string} iso
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
