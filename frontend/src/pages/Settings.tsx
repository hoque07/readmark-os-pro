import { CheckCircle2, Cloud, Database, Download, ExternalLink, KeyRound, Server, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_DOCS_URL, API_URL, api } from '../api/client'
import { ErrorNotice } from '../components/ErrorNotice'
import { Loading } from '../components/Loading'
import { useAuth } from '../contexts/AuthContext'
import type { PublicConfig } from '../types'

export function SettingsPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [health, setHealth] = useState('Checking…')
  const [busy, setBusy] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([api.health(), api.config()])
      .then(([healthData, configData]) => {
        setHealth(`${healthData.app} · ${healthData.environment}`)
        setConfig(configData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not read server settings.'))
  }, [])

  const downloadBackup = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `readmark-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setMessage('Backup downloaded. Keep it in a private and backed-up folder.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup download failed.')
    } finally {
      setBusy(false)
    }
  }

  const changePassword = async () => {
    setError('')
    setMessage('')
    if (newPassword.length < 10) {
      setError('The new password must contain at least 10 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    setPasswordBusy(true)
    try {
      const result = await api.changePassword(currentPassword, newPassword)
      setMessage(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed.')
    } finally {
      setPasswordBusy(false)
    }
  }

  if (!config && !error) return <Loading label="Reading workspace settings…" />

  return (
    <div className="settings-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">OWNER WORKSPACE</span>
          <h1>Settings & Data</h1>
          <p>Check your backend, AI connection, secure the owner account and export a complete portable backup.</p>
        </div>
      </div>
      {error && <ErrorNotice message={error} />}
      {message && <div className="success-notice"><CheckCircle2 size={18} /> {message}</div>}

      <div className="settings-grid">
        <section className="panel settings-card">
          <span className="settings-icon"><Server /></span>
          <div><small>SERVER STATUS</small><h2>{health}</h2><p>{API_URL}</p></div>
          <span className="status-online">Online</span>
        </section>
        <section className="panel settings-card">
          <span className="settings-icon"><Cloud /></span>
          <div><small>EDITORIAL ENGINE</small><h2>{config?.ai_enabled ? 'OpenAI connected' : 'Offline generator active'}</h2><p>{config?.ai_enabled ? 'Notes use the configured server-side model.' : 'Everything works locally without a paid API.'}</p></div>
        </section>
        <section className="panel settings-card">
          <span className="settings-icon"><KeyRound /></span>
          <div><small>OWNER ACCOUNT</small><h2>{user?.display_name}</h2><p>{user?.email}</p></div>
        </section>
      </div>

      <section className="panel data-panel">
        <div>
          <span className="eyebrow"><Database size={15} /> PORTABLE DATA</span>
          <h2>Download a complete JSON backup</h2>
          <p>The export includes posts, drafts, raw notes, reading progress and review history. Uploaded image files remain in <code>backend/uploads</code> and should be copied separately.</p>
        </div>
        <button className="button button-primary" disabled={busy} onClick={() => void downloadBackup()}><Download size={18} /> {busy ? 'Preparing…' : 'Download Backup'}</button>
      </section>

      <section className="panel password-panel">
        <div className="password-copy"><span className="eyebrow"><ShieldCheck size={15} /> ACCOUNT SECURITY</span><h2>Change owner password</h2><p>Use this before deploying publicly. The new password is hashed in the database and is never returned by the API.</p></div>
        <div className="password-form">
          <label><span>Current password</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
          <label><span>New password</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          <label><span>Confirm new password</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <button className="button button-outline" disabled={passwordBusy || !currentPassword || !newPassword || !confirmPassword} onClick={() => void changePassword()}>{passwordBusy ? 'Updating…' : 'Update Password'}</button>
        </div>
      </section>

      <div className="settings-grid lower-settings">
        <section className="panel settings-detail">
          <ShieldCheck />
          <div><h3>Security checklist</h3><p>Change the secret key before deployment. Keep API keys only in <code>backend/.env</code> or your cloud host’s secret manager.</p></div>
        </section>
        <section className="panel settings-detail">
          <Database />
          <div><h3>Local database</h3><p>SQLite is stored in <code>backend/data/readmark.db</code>. Stop the backend before manually copying it.</p></div>
        </section>
        <a className="panel settings-detail settings-link" href={API_DOCS_URL} target="_blank" rel="noreferrer">
          <ExternalLink />
          <div><h3>Interactive API docs</h3><p>Open Swagger UI to inspect and test every backend endpoint.</p></div>
        </a>
      </div>
    </div>
  )
}
