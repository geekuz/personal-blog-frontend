import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getCsrfToken,
  getSession,
  loginAccount,
  logoutAccount,
  registerAccount,
} from '../api/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
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
    const authenticatedUser = await loginAccount(details, await ensureCsrf())
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
