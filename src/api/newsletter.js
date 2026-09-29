import { AuthApiError, getCsrfToken } from './auth'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

function apiUrl(path) {
  if (!configuredBaseUrl) {
    throw new AuthApiError('The blog API URL is not configured.', { code: 'CONFIGURATION_ERROR' })
  }
  return `${configuredBaseUrl}${path}`
}

async function mutation(path, details) {
  const csrf = await getCsrfToken()
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(details),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AuthApiError(body?.message ?? 'The newsletter service is unavailable.', {
      status: response.status,
      code: body?.code ?? 'REQUEST_FAILED',
      fieldErrors: body?.fieldErrors ?? null,
    })
  }
  return body
}

export function requestPublicSubscription(email) {
  return mutation('/newsletter/public/requests', { email })
}

export function confirmPublicSubscription(token) {
  return mutation('/newsletter/public/confirm', { token })
}

export function unsubscribePublicSubscription(token) {
  return mutation('/newsletter/public/unsubscribe', { token })
}
