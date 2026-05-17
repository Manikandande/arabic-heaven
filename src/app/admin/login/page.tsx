'use client'

import { useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Login failed')
      return
    }
    window.location.href = '/admin'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#1a0f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-gold)', letterSpacing: '0.08em' }}>Arabic Heaven</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.55rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#888', marginTop: '6px' }}>Admin Portal</p>
        </div>

        <div style={{ backgroundColor: '#2a1a12', border: '1px solid #3d2a1e', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#e8d5b0', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1.75rem', textTransform: 'uppercase' }}>Sign In</h1>

          {error && (
            <div style={{ backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', padding: '0.65rem 0.9rem', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@arabicheaven.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: loading ? 'rgba(200,150,12,0.5)' : 'var(--color-gold)', color: '#1a0f0a', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.6rem',
  letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #3d2a1e',
  backgroundColor: '#1a0f0a', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
  color: '#e8d5b0', outline: 'none', boxSizing: 'border-box',
}
