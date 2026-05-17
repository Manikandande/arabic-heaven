'use client'

import { useEffect, useState } from 'react'
import { menuItems, categories } from '@/lib/menuData'

export default function AdminMenu() {
  const [soldOut, setSoldOut]             = useState<string[]>([])
  const [loading, setLoading]             = useState(true)
  const [updating, setUpdating]           = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetch('/api/admin/menu')
      .then(r => r.json())
      .then(d => setSoldOut(d.soldOutItems ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function toggleItem(itemId: string, available: boolean) {
    setUpdating(itemId)
    const res = await fetch('/api/admin/menu', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, available }),
    })
    const data = await res.json()
    setSoldOut(data.soldOutItems ?? [])
    setUpdating(null)
  }

  const filtered = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory)

  const soldOutCount = soldOut.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Menu Availability</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
            {soldOutCount === 0 ? 'All items available' : `${soldOutCount} item${soldOutCount !== 1 ? 's' : ''} marked sold out`}
          </p>
        </div>
        {soldOutCount > 0 && (
          <button onClick={async () => {
            for (const id of [...soldOut]) await toggleItem(id, true)
          }} style={{ padding: '0.5rem 1rem', border: '1px solid #059669', backgroundColor: 'transparent', color: '#059669', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Mark All Available
          </button>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCategory('all')} style={{ padding: '0.4rem 0.85rem', border: `1px solid ${activeCategory === 'all' ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: activeCategory === 'all' ? 'rgba(200,150,12,0.1)' : '#fff', color: activeCategory === 'all' ? 'var(--color-gold)' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{ padding: '0.4rem 0.85rem', border: `1px solid ${activeCategory === cat.id ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: activeCategory === cat.id ? 'rgba(200,150,12,0.1)' : '#fff', color: activeCategory === cat.id ? 'var(--color-gold)' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                {['Code', 'Item', 'Category', 'Price', 'Status', 'Toggle'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isSoldOut = soldOut.includes(item.id)
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0ebe5', opacity: isSoldOut ? 0.7 : 1 }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.1em', color: 'var(--color-gold)', backgroundColor: 'rgba(200,150,12,0.08)', padding: '0.2rem 0.5rem', display: 'inline-block' }}>
                        {itemCode(item.id)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ color: 'var(--color-espresso)', fontWeight: isSoldOut ? 'normal' : 600 }}>{item.name}</p>
                      <p style={{ color: '#aaa', fontSize: '0.7rem', marginTop: '2px' }}>{item.emoji}</p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#888', textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)' }}>₹{item.price}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.2rem 0.55rem', backgroundColor: isSoldOut ? '#dc262618' : '#05966918', color: isSoldOut ? '#dc2626' : '#059669', textTransform: 'uppercase' }}>
                        {isSoldOut ? 'Sold Out' : 'Available'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => toggleItem(item.id, isSoldOut)} disabled={updating === item.id}
                        style={{ padding: '0.28rem 0.7rem', border: `1px solid ${isSoldOut ? '#059669' : '#dc2626'}`, backgroundColor: 'transparent', color: isSoldOut ? '#059669' : '#dc2626', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.08em', cursor: updating === item.id ? 'wait' : 'pointer' }}>
                        {updating === item.id ? '…' : isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const CODE_PREFIX: Record<string, string> = {
  mandi:   'MND',
  grill:   'GRL',
  rice:    'RIC',
  mezze:   'MZZ',
  bread:   'BRD',
  dessert: 'DST',
  bev:     'BEV',
}

function itemCode(id: string): string {
  const parts  = id.split('-')
  const num    = parts[parts.length - 1].padStart(2, '0')
  const cat    = parts.slice(0, -1).join('-')
  const prefix = CODE_PREFIX[cat] ?? cat.toUpperCase().slice(0, 3)
  return `${prefix}-${num}`
}
