import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorNotice } from '../components/ErrorNotice'
import { Logo } from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLocalDevelopment, setIsLocalDevelopment] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    api.config().then((config) => {
      const local = config.environment === 'development'
      setIsLocalDevelopment(local)
      if (local) {
        setEmail('admin@example.com')
        setPassword('ChangeMe123!')
      }
    }).catch(() => setIsLocalDevelopment(false))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      const destination = (location.state as { from?: string } | null)?.from || '/add'
      navigate(destination, { replace: true })
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed.') }
    finally { setBusy(false) }
  }

  return (
    <div className="login-page">
      <section className="login-card panel">
        <Logo />
        <div className="login-icon"><ShieldCheck /></div>
        <h1>Owner Workspace</h1>
        <p>Login to create, edit, publish, review and sync your reading memories.</p>
        {error && <ErrorNotice message={error} />}
        <form onSubmit={submit}>
          <label><span>Email</span><div className="input-with-icon"><Mail /><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></label>
          <label><span>Password</span><div className="input-with-icon"><Lock /><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></label>
          <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Signing in…' : <>Enter Studio <ArrowRight /></>}</button>
        </form>
        {isLocalDevelopment && <div className="local-credentials"><strong>Local development account</strong><code>admin@example.com / ChangeMe123!</code><small>Use Settings & Data to change the password before any public deployment.</small></div>}
      </section>
    </div>
  )
}
