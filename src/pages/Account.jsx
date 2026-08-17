import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import StatusMessage from '../components/ui/StatusMessage'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function Account() {
  useDocumentMeta({ title: 'Account — otabek.dev' })
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  if (isLoading) return <StatusMessage title="Loading account…">Checking your session.</StatusMessage>
  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />

  async function signOut() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-heading">Your account</h1>
      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="text-lg font-semibold text-heading">{user.displayName}</p>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        <p className="mt-4 text-sm text-muted">Role: {user.roles.join(', ')}</p>
        {!user.emailVerified && <p className="mt-2 text-sm text-muted">Email verification will be enabled in the next phase.</p>}
      </div>
      <button onClick={signOut} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-heading hover:border-accent">Log out</button>
    </section>
  )
}

export default Account
