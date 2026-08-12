import fm from 'front-matter'

// --- Loading the Markdown files ---------------------------------------------
// import.meta.glob is a Vite feature. At BUILD time it finds every file that
// matches the pattern. Options:
//   eager: true     -> import them right away (not lazy promises)
//   query: '?raw'   -> give us the file's text, not a parsed module
//   import:'default'-> the raw string is the module's default export
// Result: an object like { '../posts/hello-world.md': '---\ntitle: ...' }.
const files = import.meta.glob('../posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

// Turn one raw file (path + text) into a clean post object.
function parsePost(path, raw) {
  // fm() splits the YAML frontmatter from the Markdown body.
  const { attributes, body } = fm(raw)

  // The slug is the filename without folder or extension:
  // '../posts/hello-world.md' -> 'hello-world'. We use it in URLs later.
  const slug = path.split('/').pop().replace(/\.md$/, '')

  return {
    slug,
    title: attributes.title ?? slug,
    date: attributes.date ?? '',
    summary: attributes.summary ?? '',
    tags: attributes.tags ?? [],
    body,
  }
}

// Build the final list once, sorted newest-first. This is "derived data":
// computed from the source files, exported as a plain array the UI can map over.
export const posts = Object.entries(files)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => new Date(b.date) - new Date(a.date))

// Look up a single post by its slug (used by the post page in Phase 3/4).
export function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug)
}

// Every unique tag across all posts (used by the tag filter in Phase 5).
export function getAllTags() {
  const tags = posts.flatMap((post) => post.tags)
  return [...new Set(tags)].sort()
}
