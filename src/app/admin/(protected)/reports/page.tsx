'use client'

import { useEffect, useState } from 'react'

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'Last 7 Days' },
  { value: 'month', label: 'This Month' },
]

const TYPE_COLOR: Record<string, string> = {
  DINE_IN: '#2563eb', TAKEAWAY: '#7c3aed', DELIVERY: '#059669',
}

export default function AdminReports() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange]   = useState('today')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reports?range=${range}`)
      .then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [range])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Reports</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Revenue and sales analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              style={{ padding: '0.45rem 0.9rem', border: `1px solid ${range === r.value ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: range === r.value ? 'rgba(200,150,12,0.1)' : '#fff', color: range === r.value ? 'var(--color-gold)' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : !data ? null : (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Total Revenue',    value: `₹${data.revenue.total.toFixed(0)}` },
              { label: 'Total Orders',     value: data.revenue.orderCount },
              { label: 'Avg Order Value',  value: `₹${Number(data.revenue.avgOrderValue).toFixed(0)}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', padding: '1.25rem 1.5rem', borderLeft: '3px solid var(--color-gold)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-espresso)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Order type breakdown */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>Orders by Type</p>
              </div>
              {data.byType.length === 0
                ? <p style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888' }}>No data</p>
                : (
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {data.byType.map((t: any) => {
                      const total = data.byType.reduce((s: number, x: any) => s + x.count, 0)
                      const pct   = total > 0 ? Math.round((t.count / total) * 100) : 0
                      return (
                        <div key={t.type}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.08em', color: TYPE_COLOR[t.type] ?? '#888' }}>{t.type.replace('_', ' ')}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888' }}>{t.count} orders · ₹{t.revenue.toFixed(0)}</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#f0ebe5', borderRadius: '3px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: TYPE_COLOR[t.type] ?? '#888', borderRadius: '3px' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }
            </div>

            {/* Payment breakdown */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>Payment Status</p>
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.byPayment.map((p: any) => (
                  <div key={p.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.08em', color: p.status === 'PAID' ? '#059669' : p.status === 'UNPAID' ? '#d97706' : '#dc2626', textTransform: 'uppercase' }}>{p.status}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--color-espresso)' }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top selling items */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>Top Selling Items</p>
            </div>
            {data.topItems.length === 0
              ? <p style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888' }}>No sales data yet</p>
              : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5ddd5' }}>
                      {['Rank', 'Item', 'Qty Sold', 'Revenue'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.topItems.map((item: any, i: number) => (
                      <tr key={item.name} style={{ borderBottom: '1px solid #f0ebe5' }}>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', fontSize: '0.72rem', color: i < 3 ? 'var(--color-gold)' : '#888' }}>#{i + 1}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-espresso)', fontWeight: i < 3 ? 600 : 400 }}>{item.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{item.qty}</td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)' }}>₹{item.revenue.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </>
      )}
    </div>
  )
}
