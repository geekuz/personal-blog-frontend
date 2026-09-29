// Mirrors the backend's query parsing: words split on whitespace, "quoted
// phrases" kept together, lowercased, duplicates removed, at most 8 terms.
const TOKEN = /"([^"]*)"|(\S+)/g
const MAX_TERMS = 8

export function parseSearchTerms(query) {
  if (!query) return []
  const terms = []
  for (const match of query.matchAll(TOKEN)) {
    const term = (match[1] ?? match[2]).trim().replace(/\s+/g, ' ').toLowerCase()
    if (term && !terms.includes(term)) terms.push(term)
    if (terms.length === MAX_TERMS) break
  }
  return terms
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Splits text into matched and unmatched segments for rendering <mark>
// elements. Longer terms are tried first so a phrase wins over its words.
export function highlightSegments(text, terms) {
  if (!text) return []
  if (terms.length === 0) return [{ text, match: false }]
  const alternatives = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp)
  const pattern = new RegExp(alternatives.join('|'), 'gi')
  const segments = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), match: false })
    segments.push({ text: match[0], match: true })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), match: false })
  return segments
}
