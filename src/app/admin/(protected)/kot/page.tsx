'use client'

import { useEffect, useState, useCallback } from 'react'

const STATUS_ORDER  = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY']
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', PREPARING: '#7c3aed', READY: '#059669',
}
const STATUS_NEXT: Record<string, string> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY',
}
const STATUS_NEXT_LABEL: Record<string, string> = {
  PENDING: 'Confirm', CONFIRMED: 'Start Cooking', PREPARING: 'Mark Ready',
}

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function AdminKOT() {
  const [orders, setOrders]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const load = useCallback(() => {
    fetch('/api/admin/kot').then(r => r.json()).then(d => setOrders(d.orders ?? [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  async function advance(id: string, nextStatus: string) {
    setUpdating(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    setUpdating(null)
    load()
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)
  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {} as Record<string, number>)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>KOT & Dining</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Kitchen Order Tickets · Refreshes every 30s</p>
        </div>
        <button onClick={load} style={{ padding: '0.5rem 0.85rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', color: '#888' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')}
          style={{ padding: '0.4rem 0.85rem', border: `1px solid ${filterStatus === 'all' ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: filterStatus === 'all' ? 'rgba(200,150,12,0.1)' : '#fff', color: filterStatus === 'all' ? 'var(--color-gold)' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
          All ({orders.length})
        </button>
        {STATUS_ORDER.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '0.4rem 0.85rem', border: `1px solid ${filterStatus === s ? STATUS_COLOR[s] : '#e5ddd5'}`, backgroundColor: filterStatus === s ? `${STATUS_COLOR[s]}18` : '#fff', color: filterStatus === s ? STATUS_COLOR[s] : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}>
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p>
      : filtered.length === 0
        ? <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>No active orders right now.</p>
          </div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map(order => (
              <div key={order.id} style={{ backgroundColor: '#fff', border: `1px solid ${STATUS_COLOR[order.status]}40`, borderTop: `3px solid ${STATUS_COLOR[order.status]}`, padding: '1rem' }}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--color-espresso)', letterSpacing: '0.06em' }}>{order.orderNumber}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>{order.guestName ?? 'Guest'} · {order.type.replace('_', ' ')}</p>
                  </div>
                  <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.2rem 0.5rem', backgroundColor: `${STATUS_COLOR[order.status]}18`, color: STATUS_COLOR[order.status], textTransform: 'uppercase' }}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid #f0ebe5', borderBottom: '1px solid #f0ebe5', padding: '0.6rem 0', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {order.items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso)' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', minWidth: '20px' }}>{item.qty}×</span>
                      <span>{item.name}</span>
                      {item.notes && <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.72rem' }}>({item.notes})</span>}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888', fontStyle: 'italic', marginBottom: '0.75rem' }}>Note: {order.notes}</p>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#bbb' }}>{elapsed(order.createdAt)}</p>
                  {STATUS_NEXT[order.status] && (
                    <button onClick={() => advance(order.id, STATUS_NEXT[order.status])} disabled={updating === order.id}
                      style={{ padding: '0.3rem 0.75rem', border: `1px solid ${STATUS_COLOR[STATUS_NEXT[order.status]] ?? '#888'}`, backgroundColor: STATUS_COLOR[STATUS_NEXT[order.status]] ?? '#888', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.08em', cursor: updating === order.id ? 'wait' : 'pointer', opacity: updating === order.id ? 0.7 : 1 }}>
                      {updating === order.id ? '…' : STATUS_NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button onClick={() => advance(order.id, 'DELIVERED')} disabled={updating === order.id}
                      style={{ padding: '0.3rem 0.75rem', border: '1px solid #64748b', backgroundColor: '#64748b', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.08em', cursor: updating === order.id ? 'wait' : 'pointer' }}>
                      {updating === order.id ? '…' : 'Served ✓'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
