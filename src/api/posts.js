const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function normalizeSummary(post) {
  return {
    ...post,
    publishedAt: post.publishedAt ?? post.date ?? '',
    readingTimeMinutes: post.readingTimeMinutes,
  }
}

async function request(path, { signal } = {}) {
  const response = await fetch(`${configuredBaseUrl}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    let details
    try {
      details = await response.json()
    } catch {
      details = null
    }

    throw new ApiError(details?.message ?? 'The blog service is unavailable.', {
      status: response.status,
      code: details?.code ?? 'REQUEST_FAILED',
    })
  }

  return response.json()
}

async function getLocalPosts({ page, size, query, tag }) {
  const [{ posts }, { readingTime }] = await Promise.all([
    import('../lib/posts'),
    import('../lib/readingTime'),
  ])
  const q = query.trim().toLowerCase()
  const filtered = posts.filter((post) => {
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q)
    return matchesQuery && (!tag || post.tags.includes(tag))
  })
  const start = page * size

  return {
    items: filtered.slice(start, start + size).map((post) =>
      normalizeSummary({
        ...post,
        readingTimeMinutes: readingTime(post.body),
      }),
    ),
    page,
    size,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    hasNext: start + size < filtered.length,
  }
}

export async function getPosts({
  page = 0,
  size = 6,
  query = '',
  tag = '',
  signal,
} = {}) {
  if (!configuredBaseUrl) {
    return getLocalPosts({ page, size, query, tag })
  }

  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (query.trim()) params.set('q', query.trim())
  if (tag) params.set('tag', tag)
  return request(`/posts?${params}`, { signal })
}

export async function getPostBySlug(slug, { signal } = {}) {
  if (!configuredBaseUrl) {
    const [{ getPostBySlug: findPost }, { readingTime }] = await Promise.all([
      import('../lib/posts'),
      import('../lib/readingTime'),
    ])
    const post = findPost(slug)
    if (!post) {
      throw new ApiError('Post not found', {
        status: 404,
        code: 'POST_NOT_FOUND',
      })
    }
    return normalizeSummary({
      ...post,
      content: post.body,
      updatedAt: post.date,
      readingTimeMinutes: readingTime(post.body),
    })
  }

  return request(`/posts/${encodeURIComponent(slug)}`, { signal })
}

export async function getTags({ signal } = {}) {
  if (!configuredBaseUrl) {
    const { posts } = await import('../lib/posts')
    const counts = new Map()
    posts.forEach((post) => {
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    })
    return {
      items: [...counts]
        .map(([slug, postCount]) => ({ name: slug, slug, postCount }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  }

  return request('/tags', { signal })
}
