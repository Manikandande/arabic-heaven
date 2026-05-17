'use client'

import { useEffect, useState } from 'react'

const STATUS_OPTIONS = ['all', 'PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', SEATED: '#0891b2',
  COMPLETED: '#64748b', CANCELLED: '#dc2626', NO_SHOW: '#9ca3af',
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function todayISO() { return new Date().toISOString().split('T')[0] }

export default function AdminReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter]     = useState(todayISO())
  const [updating, setUpdating]         = useState<string | null>(null)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ status: statusFilter })
    if (dateFilter) params.set('date', dateFilter)
    fetch(`/api/admin/reservations?${params}`)
      .then(r => r.json()).then(setReservations).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, dateFilter])

  async function updateReservation(id: string, patch: Record<string, unknown>) {
    setUpdating(id)
    await fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    })
    setUpdating(null)
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Reservations</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5ddd5', fontFamily: 'var(--font-body)', fontSize: '0.82rem', backgroundColor: '#fff', color: 'var(--color-espresso)', outline: 'none', colorScheme: 'light' }} />
        <button onClick={() => setDateFilter('')} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5ddd5', backgroundColor: dateFilter ? '#fff' : 'var(--color-gold)', color: dateFilter ? '#888' : '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>ALL DATES</button>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '0.4rem 0.85rem', border: `1px solid ${statusFilter === s ? (STATUS_COLOR[s] ?? 'var(--color-gold)') : '#e5ddd5'}`, backgroundColor: statusFilter === s ? `${STATUS_COLOR[s] ?? 'var(--color-gold)'}18` : '#fff', color: statusFilter === s ? (STATUS_COLOR[s] ?? 'var(--color-gold)') : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', overflowX: 'auto' }}>
          {reservations.length === 0
            ? <p style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888' }}>No reservations found.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                    {['Guest', 'Date & Time', 'Guests', 'Deposit', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0ebe5' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <p style={{ color: 'var(--color-espresso)', fontWeight: 600 }}>{r.guestName}</p>
                        <p style={{ color: '#888', fontSize: '0.72rem' }}>{r.guestPhone}</p>
                        {r.notes && <p style={{ color: '#888', fontSize: '0.7rem', marginTop: '2px', fontStyle: 'italic' }}>{r.notes}</p>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <p>{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p style={{ color: '#888', fontSize: '0.72rem' }}>{formatTime(r.timeSlot)}</p>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>{r.partySize}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {r.depositPaid
                          ? <span style={{ color: '#059669', fontSize: '0.72rem', fontFamily: 'var(--font-heading)' }}>✓ Paid</span>
                          : (
                            <div>
                              <p style={{ color: 'var(--color-crimson)', fontSize: '0.72rem' }}>₹{r.depositAmount} pending</p>
                              {r.utrNumber && <p style={{ color: '#888', fontSize: '0.68rem' }}>UTR: {r.utrNumber}</p>}
                              {r.utrNumber && (
                                <button onClick={() => updateReservation(r.id, { depositPaid: true })} disabled={updating === r.id}
                                  style={{ marginTop: '4px', padding: '0.2rem 0.55rem', backgroundColor: '#059669', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                                  {updating === r.id ? '…' : '✓ Verify'}
                                </button>
                              )}
                            </div>
                          )
                        }
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.22rem 0.6rem', backgroundColor: `${STATUS_COLOR[r.status] ?? '#888'}18`, color: STATUS_COLOR[r.status] ?? '#888', textTransform: 'uppercase' }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {r.status === 'PENDING'    && <ActionBtn label="Confirm"  color="#2563eb" onClick={() => updateReservation(r.id, { status: 'CONFIRMED' })} loading={updating === r.id} />}
                          {r.status === 'CONFIRMED'  && <ActionBtn label="Seated"   color="#0891b2" onClick={() => updateReservation(r.id, { status: 'SEATED' })}    loading={updating === r.id} />}
                          {r.status === 'SEATED'     && <ActionBtn label="Complete" color="#059669" onClick={() => updateReservation(r.id, { status: 'COMPLETED' })} loading={updating === r.id} />}
                          {!['CANCELLED','COMPLETED','NO_SHOW'].includes(r.status) && (
                            <>
                              <ActionBtn label="No-show"  color="#9ca3af" onClick={() => updateReservation(r.id, { status: 'NO_SHOW' })}   loading={updating === r.id} />
                              <ActionBtn label="Cancel"   color="#dc2626" onClick={() => updateReservation(r.id, { status: 'CANCELLED' })} loading={updating === r.id} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  )
}

function ActionBtn({ label, color, onClick, loading }: { label: string; color: string; onClick: () => void; loading: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ padding: '0.25rem 0.6rem', border: `1px solid ${color}`, backgroundColor: 'transparent', color, fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
      {loading ? '…' : label}
    </button>
  )
}
