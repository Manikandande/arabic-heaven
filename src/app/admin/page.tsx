'use client'

import { useEffect, useState } from 'react'

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', PREPARING: '#7c3aed',
  READY: '#059669', DELIVERED: '#64748b', CANCELLED: '#dc2626',
  SEATED: '#0891b2', COMPLETED: '#64748b', NO_SHOW: '#dc2626',
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.25rem 1.5rem', borderLeft: `3px solid ${accent ? 'var(--color-crimson)' : 'var(--color-gold)'}` }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: accent ? 'var(--color-crimson)' : 'var(--color-espresso)' }}>{value}</p>
      {sub && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888', marginTop: '0.2rem' }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p>
  if (!data)   return <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-crimson)' }}>Failed to load dashboard.</p>

  const { stats, recentOrders, recentReservations } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Dashboard</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#888', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Pending Orders"       value={stats.pendingOrders}      accent={stats.pendingOrders > 0} />
        <StatCard label="Today's Orders"        value={stats.todayOrders}        sub="total placed today" />
        <StatCard label="Today's Revenue"       value={`₹${stats.todayRevenue}`} sub="excl. cancelled" />
        <StatCard label="Pending Reservations"  value={stats.pendingReservations} accent={stats.pendingReservations > 0} />
        <StatCard label="Today's Reservations"  value={stats.todayReservations} />
        <StatCard label="Pending UTR Verify"    value={stats.pendingUtr}          accent={stats.pendingUtr > 0} sub="deposits unverified" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Orders */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5ddd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Recent Orders</p>
            <a href="/admin/orders" style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-gold)', textDecoration: 'none' }}>View all →</a>
          </div>
          {recentOrders.length === 0
            ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#888', textAlign: 'center' }}>No orders yet</p>
            : recentOrders.map((o: any) => (
              <div key={o.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0ebe5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)' }}>{o.orderNumber}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#888' }}>{o.guestName} · {o.itemCount} item{o.itemCount !== 1 ? 's' : ''} · ₹{o.total}</p>
                </div>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.2rem 0.55rem', backgroundColor: `${STATUS_COLOR[o.status]}18`, color: STATUS_COLOR[o.status], textTransform: 'uppercase' }}>
                  {o.status}
                </span>
              </div>
            ))
          }
        </div>

        {/* Recent Reservations */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5ddd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Recent Reservations</p>
            <a href="/admin/reservations" style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-gold)', textDecoration: 'none' }}>View all →</a>
          </div>
          {recentReservations.length === 0
            ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#888', textAlign: 'center' }}>No reservations yet</p>
            : recentReservations.map((r: any) => (
              <div key={r.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0ebe5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)' }}>{r.guestName} · {r.partySize} guests</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#888' }}>
                    {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {formatTime(r.timeSlot)}
                    {!r.depositPaid && <span style={{ color: 'var(--color-crimson)', marginLeft: '6px' }}>· UTR pending</span>}
                  </p>
                </div>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.2rem 0.55rem', backgroundColor: `${STATUS_COLOR[r.status]}18`, color: STATUS_COLOR[r.status], textTransform: 'uppercase' }}>
                  {r.status}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
