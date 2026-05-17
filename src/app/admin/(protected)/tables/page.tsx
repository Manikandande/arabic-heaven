'use client'

import { useEffect, useState } from 'react'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', SEATED: '#0891b2',
  COMPLETED: '#64748b', CANCELLED: '#dc2626', NO_SHOW: '#9ca3af',
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function AdminTables() {
  const [tables, setTables]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState({ tableNumber: '', capacity: '' })
  const [addErr, setAddErr]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  // Book table modal state
  const [bookingTable, setBookingTable] = useState<any | null>(null)
  const [bookForm, setBookForm] = useState({ guestName: '', guestPhone: '', partySize: '', timeSlot: '', notes: '' })
  const [bookErr, setBookErr]   = useState('')
  const [booking, setBooking]   = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/admin/tables').then(r => r.json()).then(d => setTables(d.tables ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function addTable(e: React.FormEvent) {
    e.preventDefault()
    setAddErr('')
    setSaving(true)
    const res = await fetch('/api/admin/tables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber: addForm.tableNumber, capacity: Number(addForm.capacity) }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setAddErr(data.error ?? 'Failed to add table'); return }
    setShowAdd(false)
    setAddForm({ tableNumber: '', capacity: '' })
    load()
  }

  async function toggleActive(id: string, isActive: boolean) {
    setUpdating(id)
    await fetch(`/api/admin/tables/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    setUpdating(null)
    load()
  }

  async function deleteTable(id: string) {
    if (!confirm('Delete this table? Existing reservations linked to it will be unlinked.')) return
    setUpdating(id)
    await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' })
    setUpdating(null)
    load()
  }

  async function bookTable(e: React.FormEvent) {
    e.preventDefault()
    setBookErr('')
    setBooking(true)
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: bookForm.guestName,
        guestPhone: bookForm.guestPhone,
        partySize: Number(bookForm.partySize),
        date: today,
        timeSlot: bookForm.timeSlot,
        notes: bookForm.notes,
        tableId: bookingTable?.id,
      }),
    })
    const data = await res.json()
    setBooking(false)
    if (!res.ok) { setBookErr(data.error ?? 'Failed to create reservation'); return }
    setBookingTable(null)
    setBookForm({ guestName: '', guestPhone: '', partySize: '', timeSlot: '', notes: '' })
    load()
  }

  const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Tables</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
            {tables.filter(t => t.isActive).length} active tables · Today's bookings shown
          </p>
        </div>
        <button onClick={() => { setShowAdd(s => !s); setAddErr('') }}
          style={{ padding: '0.5rem 1.1rem', border: '1px solid var(--color-gold)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
          {showAdd ? 'Cancel' : '+ Add Table'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addTable} style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Table Number / Name</label>
            <input value={addForm.tableNumber} onChange={e => setAddForm(f => ({ ...f, tableNumber: e.target.value }))}
              placeholder="e.g. T1 or VIP-1" required style={{ ...inputStyle, width: '160px' }} />
          </div>
          <div>
            <label style={labelStyle}>Seating Capacity</label>
            <input type="number" min={1} max={20} value={addForm.capacity} onChange={e => setAddForm(f => ({ ...f, capacity: e.target.value }))}
              placeholder="4" required style={{ ...inputStyle, width: '100px' }} />
          </div>
          {addErr && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-crimson)' }}>{addErr}</p>}
          <button type="submit" disabled={saving}
            style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--color-espresso)', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Adding…' : 'Add Table'}
          </button>
        </form>
      )}

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p>
      : tables.length === 0
        ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: '#888', marginBottom: '0.5rem' }}>No tables configured yet.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#aaa' }}>Add tables to manage dining reservations.</p>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {tables.map(table => {
              const activeResv = table.reservations.filter((r: any) => !['CANCELLED', 'NO_SHOW'].includes(r.status))
              const isOccupied = activeResv.some((r: any) => r.status === 'SEATED')
              const isBooked   = activeResv.length > 0 && !isOccupied

              return (
                <div key={table.id} style={{
                  backgroundColor: '#fff',
                  border: `1px solid ${!table.isActive ? '#e5ddd5' : isOccupied ? '#0891b240' : isBooked ? '#2563eb30' : '#e5ddd5'}`,
                  borderTop: `3px solid ${!table.isActive ? '#e5ddd5' : isOccupied ? '#0891b2' : isBooked ? '#2563eb' : '#059669'}`,
                  padding: '1.1rem',
                  opacity: table.isActive ? 1 : 0.6,
                }}>
                  {/* Table header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em' }}>Table {table.tableNumber}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>Seats {table.capacity}</p>
                    </div>
                    <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', padding: '0.18rem 0.45rem', textTransform: 'uppercase', backgroundColor: !table.isActive ? '#88888820' : isOccupied ? '#0891b220' : isBooked ? '#2563eb20' : '#05966920', color: !table.isActive ? '#888' : isOccupied ? '#0891b2' : isBooked ? '#2563eb' : '#059669' }}>
                      {!table.isActive ? 'Inactive' : isOccupied ? 'Occupied' : isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  {/* Today's reservations */}
                  {activeResv.length > 0 && (
                    <div style={{ borderTop: '1px solid #f0ebe5', paddingTop: '0.6rem', marginBottom: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {activeResv.map((r: any) => (
                        <div key={r.id} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-espresso)', fontWeight: 600 }}>{r.guestName}</span>
                            <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-heading)', color: STATUS_COLOR[r.status], textTransform: 'uppercase' }}>{r.status}</span>
                          </div>
                          <span style={{ color: '#888' }}>{fmtTime(r.timeSlot)} · {r.partySize} guests</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {table.isActive && (
                      <button onClick={() => { setBookingTable(table); setBookErr('') }}
                        style={{ flex: 1, padding: '0.35rem 0.6rem', border: '1px solid #2563eb', backgroundColor: 'transparent', color: '#2563eb', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                        + Book
                      </button>
                    )}
                    <button onClick={() => toggleActive(table.id, !table.isActive)} disabled={updating === table.id}
                      style={{ padding: '0.35rem 0.6rem', border: '1px solid #e5ddd5', backgroundColor: 'transparent', color: '#888', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                      {updating === table.id ? '…' : table.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteTable(table.id)} disabled={updating === table.id}
                      style={{ padding: '0.35rem 0.5rem', border: '1px solid #dc262640', backgroundColor: 'transparent', color: '#dc2626', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      {/* Book Table Modal */}
      {bookingTable && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '460px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em' }}>
                Book Table {bookingTable.tableNumber}
              </p>
              <button onClick={() => setBookingTable(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            <form onSubmit={bookTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookErr && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-crimson)', backgroundColor: 'rgba(139,26,42,0.06)', padding: '0.5rem 0.75rem' }}>{bookErr}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Guest Name</label>
                  <input value={bookForm.guestName} onChange={e => setBookForm(f => ({ ...f, guestName: e.target.value }))} required placeholder="Ahmed Al-Rashid" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={bookForm.guestPhone} onChange={e => setBookForm(f => ({ ...f, guestPhone: e.target.value }))} required placeholder="+91 98765 43210" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Party Size</label>
                  <input type="number" min={1} max={bookingTable.capacity} value={bookForm.partySize} onChange={e => setBookForm(f => ({ ...f, partySize: e.target.value }))} required placeholder={`Max ${bookingTable.capacity}`} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Time Slot</label>
                  <select value={bookForm.timeSlot} onChange={e => setBookForm(f => ({ ...f, timeSlot: e.target.value }))} required style={inputStyle}>
                    <option value="">Select time</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t.replace(':', ':')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input value={bookForm.notes} onChange={e => setBookForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requests" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={booking}
                  style={{ flex: 1, padding: '0.7rem', backgroundColor: 'var(--color-espresso)', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: booking ? 'wait' : 'pointer', opacity: booking ? 0.7 : 1 }}>
                  {booking ? 'Booking…' : 'Confirm Booking'}
                </button>
                <button type="button" onClick={() => setBookingTable(null)}
                  style={{ padding: '0.7rem 1.25rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.08em', cursor: 'pointer', color: '#888' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.35rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box' }
