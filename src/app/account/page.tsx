'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, MapPin, LogOut, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tab, setTab]           = useState<'profile' | 'orders' | 'addresses'>('profile')
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/signin')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? '')
      setPhone(user.user_metadata?.phone ?? '')
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim() },
    })
    setSaving(false)
    if (error) { setSaveMsg('Failed to save. Please try again.'); return }
    setSaveMsg('Saved!')
    setEditing(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function handleCancel() {
    setFullName(user?.user_metadata?.full_name ?? '')
    setPhone(user?.user_metadata?.phone ?? '')
    setEditing(false)
    setSaveMsg('')
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--color-espresso-lt)' }}>Loading…</p>
      </main>
    )
  }

  const initials = (fullName || user.email || 'U').slice(0, 2).toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-terra)', marginBottom: '0.4rem' }}>My Account</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-gold)', letterSpacing: '0.06em' }}>Arabic Heaven</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Sidebar ── */}
          <div>
            {/* Avatar card */}
            <div className="card-arabic" style={{ padding: '1.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1rem', border: '2px solid var(--color-gold)', overflow: 'hidden', backgroundColor: 'var(--color-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{initials}</span>
                }
              </div>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                {fullName || 'My Account'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-espresso-lt)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
            </div>

            {/* Nav */}
            <div className="card-arabic" style={{ overflow: 'hidden' }}>
              {([
                { id: 'profile',   label: 'Profile',   icon: User },
                { id: 'orders',    label: 'My Orders',  icon: ShoppingBag },
                { id: 'addresses', label: 'Addresses',  icon: MapPin },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', background: tab === id ? 'var(--color-bg-tertiary)' : 'none', border: 'none', borderLeft: tab === id ? '3px solid var(--color-terra)' : '3px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}>
                  <Icon size={15} color={tab === id ? 'var(--color-terra)' : 'var(--color-espresso-lt)'} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tab === id ? 'var(--color-terra)' : 'var(--color-espresso-lt)' }}>{label}</span>
                </button>
              ))}

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />

              <button onClick={handleSignOut}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { (e.currentTarget.style.backgroundColor = 'rgba(139,26,42,0.05)') }}
                onMouseLeave={(e) => { (e.currentTarget.style.backgroundColor = 'transparent') }}>
                <LogOut size={15} color="var(--color-crimson)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-crimson)' }}>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ── Main panel ── */}
          <div>

            {/* ── Profile tab ── */}
            {tab === 'profile' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em' }}>Personal Details</h2>
                    <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', marginTop: '2px' }}>Manage your name and contact info</p>
                  </div>
                  {!editing && (
                    <button onClick={() => setEditing(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', transition: 'border-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terra)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <Edit2 size={12} />
                      Edit
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div style={{ backgroundColor: saveMsg === 'Saved!' ? 'rgba(34,139,34,0.08)' : 'rgba(139,26,42,0.08)', border: `1px solid ${saveMsg === 'Saved!' ? 'rgba(34,139,34,0.25)' : 'rgba(139,26,42,0.2)'}`, borderRadius: '4px', padding: '0.6rem 1rem', marginBottom: '1.25rem' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: saveMsg === 'Saved!' ? '#228B22' : 'var(--color-crimson)', margin: 0 }}>{saveMsg}</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Full name */}
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    {editing
                      ? <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }} />
                      : <p style={valueStyle}>{fullName || <span style={{ color: 'var(--color-espresso-lt)', fontStyle: 'italic' }}>Not set</span>}</p>
                    }
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <p style={{ ...valueStyle, color: 'var(--color-espresso-lt)' }}>{user.email}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '4px' }}>Email cannot be changed here</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    {editing
                      ? <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-terra)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,98,42,0.1)' }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }} />
                      : <p style={valueStyle}>{phone || <span style={{ color: 'var(--color-espresso-lt)', fontStyle: 'italic' }}>Not set</span>}</p>
                    }
                  </div>

                  {/* Login method */}
                  <div>
                    <label style={labelStyle}>Sign-in Method</label>
                    <p style={valueStyle}>
                      {user.app_metadata?.provider === 'google' ? 'Google Account' : 'Email & Password'}
                    </p>
                  </div>

                  {/* Account created */}
                  <div>
                    <label style={labelStyle}>Member Since</label>
                    <p style={valueStyle}>
                      {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {editing && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                    <button onClick={handleSave} disabled={saving} className="btn-gold"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', fontSize: '0.7rem', opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}>
                      <Check size={13} />
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={handleCancel}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)' }}>
                      <X size={13} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Orders tab ── */}
            {tab === 'orders' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>My Orders</h2>
                <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', marginBottom: '2rem' }}>Your order history will appear here</p>

                <div style={{ textAlign: 'center', padding: '3rem 2rem', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  <ShoppingBag size={36} color="var(--color-border-strong)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-espresso-lt)', marginBottom: '1.25rem' }}>No orders yet</p>
                  <Link href="/order" className="btn-gold" style={{ fontSize: '0.7rem', padding: '0.6rem 1.5rem' }}>
                    Order Now
                  </Link>
                </div>
              </div>
            )}

            {/* ── Addresses tab ── */}
            {tab === 'addresses' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Saved Addresses</h2>
                <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', marginBottom: '2rem' }}>Delivery addresses for faster checkout</p>

                <div style={{ textAlign: 'center', padding: '3rem 2rem', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  <MapPin size={36} color="var(--color-border-strong)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-espresso-lt)', marginBottom: '0.5rem' }}>No addresses saved</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)' }}>Addresses will be saved when you place a delivery order</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.62rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-espresso-lt)',
  marginBottom: '0.4rem',
}

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  color: 'var(--color-espresso)',
  padding: '0.55rem 0',
  borderBottom: '1px solid var(--color-border)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
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
