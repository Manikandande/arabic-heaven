'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',              label: 'Dashboard',     icon: '◈' },
  { href: '/admin/reservations', label: 'Reservations',  icon: '🗓' },
  { href: '/admin/orders',       label: 'Orders',        icon: '🧾' },
  { href: '/admin/menu',         label: 'Menu',          icon: '🍽' },
  { href: '/admin/logs',         label: 'Event Logs',    icon: '📋' },
  { href: '/admin/settings',     label: 'Settings',      icon: '⚙' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
      backgroundColor: '#1a0f0a', borderRight: '1px solid rgba(200,150,12,0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 200,
    }}>
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(200,150,12,0.15)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-gold)', letterSpacing: '0.06em', marginBottom: '2px' }}>Arabic Heaven</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,150,12,0.5)' }}>Admin Portal</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === '/admin' ? path === '/admin' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '4px',
                backgroundColor: isActive ? 'rgba(200,150,12,0.12)' : 'transparent',
                color: isActive ? 'var(--color-gold)' : 'rgba(253,246,238,0.5)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: `2px solid ${isActive ? 'var(--color-gold)' : 'transparent'}`,
              }}
            >
              <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center' }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(200,150,12,0.15)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(253,246,238,0.35)', textDecoration: 'none' }}>
          ← Back to site
        </Link>
      </div>
    </aside>
  )
}
