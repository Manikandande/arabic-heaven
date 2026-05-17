'use client'

import { useEffect, useState } from 'react'

const ROLES = ['STAFF', 'MANAGER']
const ROLE_COLOR: Record<string, string> = {
  STAFF: '#2563eb', MANAGER: '#7c3aed', ADMIN: '#d97706', SUPER_ADMIN: '#dc2626',
}

export default function AdminEmployees() {
  const [staff, setStaff]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ email: '', role: 'STAFF' })
  const [formErr, setFormErr]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/admin/employees').then(r => r.json()).then(d => setStaff(d.staff ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function addStaff(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    setSaving(true)
    const res = await fetch('/api/admin/employees', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setFormErr(data.error ?? 'Failed to add staff'); return }
    setShowForm(false)
    setForm({ email: '', role: 'STAFF' })
    load()
  }

  async function toggleActive(id: string, isActive: boolean) {
    setUpdating(id)
    await fetch(`/api/admin/employees/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    setUpdating(null)
    load()
  }

  async function removeStaff(id: string) {
    if (!confirm('Remove this staff member?')) return
    setUpdating(id)
    await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' })
    setUpdating(null)
    load()
  }

  const active   = staff.filter(s => s.isActive).length
  const inactive = staff.filter(s => !s.isActive).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Employee Management</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
            {active} active · {inactive} inactive
          </p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setFormErr('') }}
          style={{ padding: '0.5rem 1.1rem', border: '1px solid var(--color-gold)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addStaff} style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Add Staff Member</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888', backgroundColor: '#faf6f0', padding: '0.6rem 0.85rem', borderLeft: '3px solid var(--color-gold)' }}>
            The person must first create an account on the website before they can be added as staff.
          </p>
          {formErr && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-crimson)', backgroundColor: 'rgba(139,26,42,0.06)', padding: '0.5rem 0.75rem' }}>{formErr}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Account Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="staff@example.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving}
            style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-espresso)', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Adding…' : 'Add to Staff'}
          </button>
        </form>
      )}

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        staff.length === 0
          ? (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>No staff members yet.</p>
            </div>
          )
          : (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                    {['Employee', 'Contact', 'Role', 'Status', 'Since', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f0ebe5', opacity: s.isActive ? 1 : 0.6 }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${ROLE_COLOR[s.role] ?? '#888'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: ROLE_COLOR[s.role] ?? '#888', flexShrink: 0 }}>
                            {(s.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <p style={{ color: 'var(--color-espresso)', fontWeight: 600 }}>{s.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <p style={{ color: '#666', fontSize: '0.78rem' }}>{s.email}</p>
                        {s.phone && <p style={{ color: '#888', fontSize: '0.72rem' }}>{s.phone}</p>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.18rem 0.5rem', backgroundColor: `${ROLE_COLOR[s.role] ?? '#888'}18`, color: ROLE_COLOR[s.role] ?? '#888', textTransform: 'uppercase' }}>
                          {s.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.65rem', color: s.isActive ? '#059669' : '#888', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em' }}>
                          {s.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#888', fontSize: '0.75rem' }}>
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => toggleActive(s.id, !s.isActive)} disabled={updating === s.id}
                            style={{ padding: '0.25rem 0.6rem', border: `1px solid ${s.isActive ? '#888' : '#059669'}`, backgroundColor: 'transparent', color: s.isActive ? '#888' : '#059669', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                            {updating === s.id ? '…' : s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => removeStaff(s.id)} disabled={updating === s.id}
                            style={{ padding: '0.25rem 0.6rem', border: '1px solid #dc2626', backgroundColor: 'transparent', color: '#dc2626', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.35rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box' }
