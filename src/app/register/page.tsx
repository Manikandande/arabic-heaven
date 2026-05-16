'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const auth = getFirebaseAuth()!
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name.trim() })
      router.push('/')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      const auth = getFirebaseAuth()!
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.push('/')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') setError(friendlyError(err.code))
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 3rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-gold)', letterSpacing: '0.08em' }}>
              Arabic Heaven
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginTop: '4px' }}>
              ✦ &nbsp; Mandi &nbsp; ✦
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="card-arabic" style={{ padding: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.4rem', textAlign: 'center' }}>
            Create Account
          </h1>
          <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--color-espresso-lt)', textAlign: 'center', marginBottom: '2rem' }}>
            Join us for exclusive offers & easy ordering
          </p>

          {error && (
            <div style={{ backgroundColor: 'rgba(139,26,42,0.08)', border: '1px solid rgba(139,26,42,0.2)', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-crimson)', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat your password"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.78rem', letterSpacing: '0.1em', marginTop: '0.4rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso)', transition: 'border-color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terra-light)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', textAlign: 'center', marginTop: '1.75rem' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: 'var(--color-terra)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.6 }}>
          By creating an account you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--color-terra)' }}>Terms</Link>
          {' & '}
          <Link href="/privacy" style={{ color: 'var(--color-terra)' }}>Privacy Policy</Link>.
        </p>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.65rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--color-espresso-lt)',
  marginBottom: '0.4rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  backgroundColor: 'var(--color-bg-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.88rem',
  color: 'var(--color-espresso)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box',
}

function friendlyError(code: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
