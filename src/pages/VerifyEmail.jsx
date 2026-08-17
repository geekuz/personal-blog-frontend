import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import StatusMessage from '../components/ui/StatusMessage'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

function VerifyEmail() {
  useDocumentMeta({ title: 'Verify email — otabek.dev' })
  const [searchParams] = useSearchParams()
  const { verifyEmail } = useAuth()
  const started = useRef(false)
  const token = searchParams.get('token')
  const [state, setState] = useState(() => token
    ? { status: 'loading', message: '' }
    : { status: 'error', message: 'This verification link is incomplete.' })

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!token) return
    verifyEmail(token)
      .then(() => setState({ status: 'success', message: 'Your email address is verified.' }))
      .catch((error) => setState({ status: 'error', message: error.message }))
  }, [token, verifyEmail])

  if (state.status === 'loading') {
    return <StatusMessage title="Verifying email…">Checking your secure verification link.</StatusMessage>
  }

  return (
    <section className="mx-auto max-w-md text-center">
      <h1 className="text-3xl font-bold text-heading">
        {state.status === 'success' ? 'Email verified' : 'Verification failed'}
      </h1>
      <p className="mt-4 text-muted">{state.message}</p>
      <Link to={state.status === 'success' ? '/account' : '/login'} className="mt-8 inline-block rounded-lg bg-accent px-4 py-2.5 font-medium text-white">
        {state.status === 'success' ? 'Open account' : 'Return to login'}
      </Link>
    </section>
  )
}

export default VerifyEmail
