const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(path, { signal } = {}) {
  if (!configuredBaseUrl) {
    throw new ApiError('The blog API URL is not configured.', {
      code: 'CONFIGURATION_ERROR',
    })
  }

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

export async function getPosts({
  page = 0,
  size = 6,
  query = '',
  tag = '',
  signal,
} = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (query.trim()) params.set('q', query.trim())
  if (tag) params.set('tag', tag)
  return request(`/posts?${params}`, { signal })
}

export async function getPostBySlug(slug, { signal } = {}) {
  return request(`/posts/${encodeURIComponent(slug)}`, { signal })
}

export async function getTags({ signal } = {}) {
  return request('/tags', { signal })
}
