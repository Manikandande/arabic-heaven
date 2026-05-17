'use client'

import { useEffect, useState } from 'react'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', PREPARING: '#7c3aed',
  READY: '#0891b2', OUT_FOR_DELIVERY: '#6366f1', DELIVERED: '#059669', CANCELLED: '#dc2626',
}
const NEXT_STATUS: Record<string, { label: string; status: string }> = {
  PENDING:          { label: 'Confirm',      status: 'CONFIRMED' },
  CONFIRMED:        { label: 'Start Prep',   status: 'PREPARING' },
  PREPARING:        { label: 'Packed',       status: 'READY' },
  READY:            { label: 'Out for Del.', status: 'OUT_FOR_DELIVERY' },
  OUT_FOR_DELIVERY: { label: 'Delivered ✓', status: 'DELIVERED' },
}

const FILTERS = ['all', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function AdminDelivery() {
  const [orders, setOrders]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch(`/api/admin/delivery?status=${statusFilter}`)
      .then(r => r.json()).then(d => setOrders(d.orders ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [statusFilter])

  async function advance(id: string, nextStatus: string) {
    setUpdating(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    setUpdating(null)
    load()
  }

  const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Delivery Management</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
            {active > 0 ? `${active} active delivery order${active !== 1 ? 's' : ''}` : 'No active deliveries'}
          </p>
        </div>
        <button onClick={load} style={{ padding: '0.5rem 0.85rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', color: '#888' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '0.4rem 0.75rem', border: `1px solid ${statusFilter === s ? (STATUS_COLOR[s] ?? 'var(--color-gold)') : '#e5ddd5'}`, backgroundColor: statusFilter === s ? `${STATUS_COLOR[s] ?? 'var(--color-gold)'}18` : '#fff', color: statusFilter === s ? (STATUS_COLOR[s] ?? 'var(--color-gold)') : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase' }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p>
      : orders.length === 0
        ? <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>No delivery orders found.</p>
          </div>
        : (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                  {['Order', 'Customer', 'Deliver To', 'Items', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0ebe5', opacity: o.status === 'CANCELLED' ? 0.6 : 1 }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)' }}>{o.orderNumber}</p>
                      <p style={{ color: '#bbb', fontSize: '0.65rem', marginTop: '2px' }}>{elapsed(o.createdAt)}</p>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <p style={{ color: 'var(--color-espresso)', fontWeight: 600 }}>{o.guestName ?? '—'}</p>
                      {o.guestPhone && <p style={{ color: '#888', fontSize: '0.72rem' }}>{o.guestPhone}</p>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                      <p style={{ color: '#666', fontSize: '0.78rem', lineHeight: 1.4 }}>{o.address ?? '—'}</p>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#666' }}>
                      {o.items.map((i: any, idx: number) => (
                        <p key={idx} style={{ fontSize: '0.75rem' }}>{i.qty}× {i.name}</p>
                      ))}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)' }}>₹{o.total.toFixed(0)}</p>
                      {o.deliveryFee > 0 && <p style={{ fontSize: '0.65rem', color: '#888' }}>+₹{o.deliveryFee} del.</p>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', backgroundColor: `${STATUS_COLOR[o.status]}18`, color: STATUS_COLOR[o.status], textTransform: 'uppercase' }}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {NEXT_STATUS[o.status] && (
                        <button onClick={() => advance(o.id, NEXT_STATUS[o.status].status)} disabled={updating === o.id}
                          style={{ padding: '0.28rem 0.65rem', border: `1px solid ${STATUS_COLOR[NEXT_STATUS[o.status].status] ?? '#888'}`, backgroundColor: STATUS_COLOR[NEXT_STATUS[o.status].status] ?? '#888', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: updating === o.id ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                          {updating === o.id ? '…' : NEXT_STATUS[o.status].label}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
