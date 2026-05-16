'use client'

import { useEffect, useState } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json()).then(setSettings).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableCapacity: Number(settings.tableCapacity),
        upiId: settings.upiId,
        phone: settings.phone,
        email: settings.email,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p>
  if (!settings) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '560px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Settings</h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <Section title="Reservations">
          <Field label="Max Tables per Slot" hint="How many simultaneous bookings allowed per time slot">
            <input type="number" min={1} max={50} value={settings.tableCapacity}
              onChange={e => setSettings((p: any) => ({ ...p, tableCapacity: e.target.value }))}
              style={inputStyle} />
          </Field>
          <Field label="UPI ID" hint="Used on the booking payment screen">
            <input type="text" value={settings.upiId ?? ''} placeholder="e.g. 7942696368@paytm"
              onChange={e => setSettings((p: any) => ({ ...p, upiId: e.target.value }))}
              style={inputStyle} />
          </Field>
        </Section>

        <Section title="Contact">
          <Field label="Phone">
            <input type="text" value={settings.phone ?? ''}
              onChange={e => setSettings((p: any) => ({ ...p, phone: e.target.value }))}
              style={inputStyle} />
          </Field>
          <Field label="Email">
            <input type="email" value={settings.email ?? ''}
              onChange={e => setSettings((p: any) => ({ ...p, email: e.target.value }))}
              style={inputStyle} />
          </Field>
        </Section>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="submit" disabled={saving}
            style={{ padding: '0.7rem 1.75rem', backgroundColor: saving ? 'rgba(192,98,42,0.5)' : 'var(--color-terra)', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#059669' }}>✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #e5ddd5',
  backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.88rem',
  color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', paddingBottom: '0.75rem', borderBottom: '1px solid #f0ebe5' }}>{title}</p>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem' }}>{label}</label>
      {children}
      {hint && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>{hint}</p>}
    </div>
  )
}
