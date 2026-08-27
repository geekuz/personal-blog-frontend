import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getCsrfToken,
  getSession,
  getNewsletterSubscription,
  changePassword as changePasswordRequest,
  loginAccount,
  logoutAccount,
  registerAccount,
  requestPasswordReset,
  resetPassword as resetPasswordRequest,
  resendVerificationEmail,
  verifyEmailToken,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from '../api/auth'
import { AuthContext } from './auth-context'
import { createComment, deleteComment } from '../api/posts'
import { deletePost, getDashboard, savePost, uploadImage } from '../api/admin'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authNotice, setAuthNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const csrf = useRef(null)

  const ensureCsrf = useCallback(async () => {
    if (!csrf.current) csrf.current = await getCsrfToken()
    return csrf.current
  }, [])

  useEffect(() => {
    let active = true
    ensureCsrf()
      .then(() => getSession())
      .then((session) => {
        if (active) setUser(session.authenticated ? session.user : null)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [ensureCsrf])

  const login = useCallback(async (details) => {
    setAuthNotice('')
    const authenticatedUser = await loginAccount(details, await ensureCsrf())
    // Spring Security rotates the session during login, so the anonymous
    // session's CSRF token must not be reused for authenticated actions.
    csrf.current = null
    setUser(authenticatedUser)
    return authenticatedUser
  }, [ensureCsrf])

  const register = useCallback(async (details) => {
    await registerAccount(details, await ensureCsrf())
    return login({ email: details.email, password: details.password })
  }, [ensureCsrf, login])

  const logout = useCallback(async () => {
    await logoutAccount(await ensureCsrf())
    csrf.current = null
    setUser(null)
  }, [ensureCsrf])

  const verifyEmail = useCallback(async (token) => {
    const verifiedUser = await verifyEmailToken(token, await ensureCsrf())
    const session = await getSession()
    setUser(session.authenticated ? session.user : null)
    return verifiedUser
  }, [ensureCsrf])

  const resendVerification = useCallback(async () => {
    await resendVerificationEmail(await ensureCsrf())
  }, [ensureCsrf])

  const forgotPassword = useCallback(async (email) => (
    requestPasswordReset(email, await ensureCsrf())
  ), [ensureCsrf])

  const resetPassword = useCallback(async (details) => {
    await resetPasswordRequest(details, await ensureCsrf())
    csrf.current = null
    setAuthNotice('Password reset complete. All existing sessions were signed out; log in with your new password.')
    setUser(null)
  }, [ensureCsrf])

  const changePassword = useCallback(async (details) => {
    await changePasswordRequest(details, await ensureCsrf())
    csrf.current = null
    setAuthNotice('Password changed. All sessions were signed out; log in with your new password.')
    setUser(null)
  }, [ensureCsrf])

  const newsletterStatus = useCallback(() => getNewsletterSubscription(), [])

  const subscribeNewsletter = useCallback(async () => (
    subscribeToNewsletter(await ensureCsrf())
  ), [ensureCsrf])

  const unsubscribeNewsletter = useCallback(async () => {
    await unsubscribeFromNewsletter(await ensureCsrf())
  }, [ensureCsrf])

  const addComment = useCallback(async (slug, body) => (
    createComment(slug, body, await ensureCsrf())
  ), [ensureCsrf])

  const removeComment = useCallback(async (commentId) => {
    await deleteComment(commentId, await ensureCsrf())
  }, [ensureCsrf])

  const loadDashboard = useCallback((options) => getDashboard(options), [])
  const saveAdminPost = useCallback(async (currentSlug, details) => (
    savePost(currentSlug, details, await ensureCsrf())
  ), [ensureCsrf])
  const deleteAdminPost = useCallback(async (slug) => {
    await deletePost(slug, await ensureCsrf())
  }, [ensureCsrf])
  const uploadAdminImage = useCallback(async (file) => (
    uploadImage(file, await ensureCsrf())
  ), [ensureCsrf])

  return (
    <AuthContext.Provider value={{
      user, isLoading, authNotice, login, register, logout, verifyEmail, resendVerification,
      forgotPassword, resetPassword, changePassword,
      newsletterStatus, subscribeNewsletter, unsubscribeNewsletter,
      addComment, removeComment,
      loadDashboard, saveAdminPost, deleteAdminPost, uploadAdminImage,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
