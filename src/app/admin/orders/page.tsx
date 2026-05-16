'use client'

import { useEffect, useState } from 'react'

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', PREPARING: '#7c3aed',
  READY: '#059669', DELIVERED: '#64748b', CANCELLED: '#dc2626',
}
const STATUS_OPTIONS = ['all', ...STATUS_FLOW, 'CANCELLED']

function todayISO() { return new Date().toISOString().split('T')[0] }

export default function AdminOrders() {
  const [orders, setOrders]             = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter]     = useState(todayISO())
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [updating, setUpdating]         = useState<string | null>(null)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ status: statusFilter })
    if (dateFilter) params.set('date', dateFilter)
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json()).then(setOrders).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter, dateFilter])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    setUpdating(null)
    load()
  }

  function nextStatus(status: string) {
    const idx = STATUS_FLOW.indexOf(status)
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Orders</h1>

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

      {/* List */}
      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.length === 0
            ? <p style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888', backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>No orders found.</p>
            : orders.map(o => (
              <div key={o.id} style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', borderLeft: `3px solid ${STATUS_COLOR[o.status] ?? '#888'}` }}>
                {/* Header row */}
                <div style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--color-espresso)', minWidth: '130px' }}>{o.orderNumber}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#555', flex: 1 }}>{o.guestName} · {o.guestPhone}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888' }}>{o.type} · ₹{o.total}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#aaa' }}>{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.22rem 0.65rem', backgroundColor: `${STATUS_COLOR[o.status]}18`, color: STATUS_COLOR[o.status], textTransform: 'uppercase' }}>{o.status}</span>
                  {/* Next-step button */}
                  {nextStatus(o.status) && (
                    <button onClick={e => { e.stopPropagation(); updateStatus(o.id, nextStatus(o.status)!) }} disabled={updating === o.id}
                      style={{ padding: '0.3rem 0.8rem', backgroundColor: STATUS_COLOR[nextStatus(o.status)!], color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.08em', cursor: updating === o.id ? 'wait' : 'pointer', textTransform: 'uppercase' }}>
                      {updating === o.id ? '…' : `→ ${nextStatus(o.status)}`}
                    </button>
                  )}
                  {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                    <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'CANCELLED') }} disabled={updating === o.id}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #dc2626', backgroundColor: 'transparent', color: '#dc2626', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', cursor: updating === o.id ? 'wait' : 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
                {/* Expanded items */}
                {expanded === o.id && (
                  <div style={{ borderTop: '1px solid #f0ebe5', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {o.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--color-espresso)' }}>{item.name} × {item.quantity}</span>
                        <span style={{ color: '#888' }}>₹{item.totalPrice}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #f0ebe5', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '0.78rem' }}>
                      <span style={{ color: '#888' }}>Delivery fee</span><span>₹{o.deliveryFee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '0.88rem', color: 'var(--color-espresso)' }}>
                      <span>Total</span><span>₹{o.total}</span>
                    </div>
                    {o.notes && <p style={{ marginTop: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>Note: {o.notes}</p>}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
