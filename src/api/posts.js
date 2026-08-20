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
    credentials: 'include',
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

export async function getComments(slug, { signal } = {}) {
  return request(`/posts/${encodeURIComponent(slug)}/comments`, { signal })
}

export async function createComment(slug, body, csrf) {
  return commentMutation(`/posts/${encodeURIComponent(slug)}/comments`, 'POST', { body }, csrf)
}

export async function deleteComment(commentId, csrf) {
  return commentMutation(`/comments/${encodeURIComponent(commentId)}`, 'DELETE', null, csrf)
}

async function commentMutation(path, method, details, csrf) {
  if (!configuredBaseUrl) throw new ApiError('The blog API URL is not configured.', { code: 'CONFIGURATION_ERROR' })
  const response = await fetch(`${configuredBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(details === null ? {} : { 'Content-Type': 'application/json' }),
      [csrf.headerName]: csrf.token,
    },
    ...(details === null ? {} : { body: JSON.stringify(details) }),
  })
  if (response.status === 204) return null
  if (!response.ok) {
    const detailsBody = await response.json().catch(() => null)
    throw new ApiError(detailsBody?.message ?? 'The blog service is unavailable.', {
      status: response.status,
      code: detailsBody?.code ?? 'REQUEST_FAILED',
    })
  }
  return response.json()
}
