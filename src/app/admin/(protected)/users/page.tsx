'use client'

import { useEffect, useState } from 'react'

export default function AdminUsers() {
  const [users, setUsers]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [formErr, setFormErr]   = useState('')
  const [saving, setSaving]     = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setFormErr(data.error ?? 'Failed to create user'); return }
    setShowForm(false)
    setForm({ name: '', email: '', password: '' })
    load()
  }

  async function deleteUser(id: string) {
    if (!confirm('Remove this admin user?')) return
    setDeleting(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Admin Users</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Manage portal access for staff</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setFormErr('') }}
          style={{ padding: '0.5rem 1.1rem', border: '1px solid var(--color-gold)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Admin'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createUser} style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>New Admin User</p>
          {formErr && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-crimson)', backgroundColor: 'rgba(139,26,42,0.06)', padding: '0.5rem 0.75rem' }}>{formErr}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Ahmed Al-Rashid' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'ahmed@arabicheaven.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} required style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving}
              style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-espresso)', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : 'Create Admin'}
            </button>
          </div>
        </form>
      )}

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                {['Name', 'Email', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0ebe5' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(200,150,12,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-gold)', flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ color: 'var(--color-espresso)', fontWeight: 600 }}>{u.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#888', fontSize: '0.75rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button onClick={() => deleteUser(u.id)} disabled={deleting === u.id}
                      style={{ padding: '0.25rem 0.6rem', border: '1px solid #dc2626', backgroundColor: 'transparent', color: '#dc2626', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: deleting === u.id ? 'wait' : 'pointer', opacity: deleting === u.id ? 0.6 : 1 }}>
                      {deleting === u.id ? '…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.35rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box' }
