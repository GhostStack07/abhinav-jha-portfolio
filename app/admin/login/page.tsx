'use client'
import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push(params.get('from') ?? '/admin')
    } else {
      setError('Incorrect password. Try again.')
      setPassword('')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-dot" />
          AJ Admin
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">Enter your admin password to continue.</p>

        <form onSubmit={submit} className="login-form">
          <div className="login-field">
            <label className="adm-label">Password</label>
            <input
              type="password"
              className="adm-input login-input"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="adm-btn primary login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <a href="/" className="login-back">← Back to site</a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
