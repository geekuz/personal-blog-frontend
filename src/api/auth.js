const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export class AuthApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', fieldErrors = null } = {}) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

async function responseJson(response) {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AuthApiError(body?.message ?? 'The account service is unavailable.', {
      status: response.status,
      code: body?.code ?? 'REQUEST_FAILED',
      fieldErrors: body?.fieldErrors ?? null,
    })
  }
  return body
}

function apiUrl(path) {
  if (!configuredBaseUrl) {
    throw new AuthApiError('The blog API URL is not configured.', { code: 'CONFIGURATION_ERROR' })
  }
  return `${configuredBaseUrl}${path}`
}

export async function getCsrfToken() {
  const response = await fetch(apiUrl('/auth/csrf'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  return responseJson(response)
}

export async function getSession() {
  const response = await fetch(apiUrl('/auth/me'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  return responseJson(response)
}

export async function registerAccount(details, csrf) {
  return mutate('/auth/register', details, csrf)
}

export async function loginAccount(details, csrf) {
  return mutate('/auth/login', details, csrf)
}

export async function logoutAccount(csrf) {
  const response = await fetch(apiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })
  if (!response.ok) await responseJson(response)
}

export async function verifyEmailToken(token, csrf) {
  return mutate('/auth/verify-email', { token }, csrf)
}

export async function resendVerificationEmail(csrf) {
  const response = await fetch(apiUrl('/auth/verification/resend'), {
    method: 'POST',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })
  if (!response.ok) await responseJson(response)
}

export async function requestPasswordReset(email, csrf) {
  return mutate('/auth/password/forgot', { email }, csrf)
}

export async function resetPassword(details, csrf) {
  return mutate('/auth/password/reset', details, csrf)
}

export async function changePassword(details, csrf) {
  return mutate('/auth/password/change', details, csrf)
}

export async function getNewsletterSubscription() {
  const response = await fetch(apiUrl('/newsletter/subscription'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  return responseJson(response)
}

export async function subscribeToNewsletter(csrf) {
  return mutate('/newsletter/subscription', null, csrf)
}

export async function unsubscribeFromNewsletter(csrf) {
  const response = await fetch(apiUrl('/newsletter/subscription'), {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrf.headerName]: csrf.token },
  })
  if (!response.ok) await responseJson(response)
}

async function mutate(path, details, csrf) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    ...(details === null ? {} : { body: JSON.stringify(details) }),
  })
  return responseJson(response)
}
