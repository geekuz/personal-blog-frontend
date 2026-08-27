const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export class AdminApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fieldErrors = null } = {}) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

function url(path) {
  if (!configuredBaseUrl) throw new AdminApiError('The blog API URL is not configured.', { code: 'CONFIGURATION_ERROR' })
  return `${configuredBaseUrl}${path}`
}

async function parse(response) {
  if (response.status === 204) return null
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new AdminApiError(body?.message ?? 'The admin service is unavailable.', {
    status: response.status, code: body?.code ?? 'REQUEST_FAILED', fieldErrors: body?.fieldErrors ?? null,
  })
  return body
}

export async function getDashboard({ signal } = {}) {
  return parse(await fetch(url('/dashboard'), {
    signal, credentials: 'include', headers: { Accept: 'application/json' },
  }))
}

export async function savePost(currentSlug, details, csrf) {
  const path = currentSlug ? `/dashboard/posts/${encodeURIComponent(currentSlug)}` : '/dashboard/posts'
  return parse(await fetch(url(path), {
    method: currentSlug ? 'PUT' : 'POST', credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify(details),
  }))
}

export async function deletePost(slug, csrf) {
  return parse(await fetch(url(`/dashboard/posts/${encodeURIComponent(slug)}`), {
    method: 'DELETE', credentials: 'include', headers: { [csrf.headerName]: csrf.token },
  }))
}

export async function uploadImage(file, csrf) {
  const body = new FormData()
  body.append('file', file)
  return parse(await fetch(url('/dashboard/media'), {
    method: 'POST', credentials: 'include', headers: { [csrf.headerName]: csrf.token }, body,
  }))
}
