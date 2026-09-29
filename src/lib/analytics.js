// Pages whose URLs can carry one-time tokens (email verification, password
// reset) or that only the signed-in owner sees. They are never reported.
const PRIVATE_PATHS = ['/admin', '/account', '/verify-email', '/reset-password']

// React Router matches routes case-insensitively, so /Admin is private too.
function isPrivate(pathname) {
  const path = pathname.toLowerCase()
  return PRIVATE_PATHS.some((privatePath) => path === privatePath || path.startsWith(`${privatePath}/`))
}

// Passed to Vercel Web Analytics as `beforeSend`. Returning null drops the
// event. Query strings and fragments are removed so search terms and tokens
// never leave the browser.
export function analyticsBeforeSend(event) {
  let url
  try {
    url = new URL(event.url)
  } catch {
    return null
  }
  if (isPrivate(url.pathname)) return null
  return { ...event, url: `${url.origin}${url.pathname}` }
}
