'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin',         label: 'Dashboard', icon: '◈' },
      { href: '/admin/reports', label: 'Reports',   icon: '📊' },
      { href: '/admin/calendar',label: 'Calendar',  icon: '📅' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/kot',      label: 'KOT & Dining', icon: '🍽' },
      { href: '/admin/billing',  label: 'Billing',      icon: '🧾' },
      { href: '/admin/delivery', label: 'Delivery',     icon: '🚴' },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { href: '/admin/reservations', label: 'Reservations', icon: '🗓' },
      { href: '/admin/tables',       label: 'Tables',       icon: '🪑' },
      { href: '/admin/orders',       label: 'Orders',       icon: '📦' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/menu',      label: 'Menu',        icon: '🍴' },
      { href: '/admin/employees', label: 'Employees',   icon: '👤' },
      { href: '/admin/users',     label: 'Admin Users', icon: '🔐' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/logs',     label: 'Event Logs', icon: '📋' },
      { href: '/admin/settings', label: 'Settings',   icon: '⚙' },
    ],
  },
]

export default function AdminSidebar() {
  const path = usePathname()

  function isActive(href: string) {
    return href === '/admin' ? path === '/admin' : path.startsWith(href)
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
      backgroundColor: '#1a0f0a', borderRight: '1px solid rgba(200,150,12,0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 200, overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(200,150,12,0.15)', flexShrink: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-gold)', letterSpacing: '0.06em', marginBottom: '2px' }}>Arabic Heaven</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,150,12,0.5)' }}>Admin Portal</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.5rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,150,12,0.35)', padding: '0.5rem 0.85rem 0.3rem' }}>
              {section.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {section.items.map(({ href, label, icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.52rem 0.85rem',
                      borderRadius: '3px',
                      backgroundColor: active ? 'rgba(200,150,12,0.12)' : 'transparent',
                      color: active ? 'var(--color-gold)' : 'rgba(253,246,238,0.45)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'all 0.12s ease',
                      borderLeft: `2px solid ${active ? 'var(--color-gold)' : 'transparent'}`,
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', width: '16px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(200,150,12,0.15)', display: 'flex', flexDirection: 'column', gap: '0.55rem', flexShrink: 0 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(253,246,238,0.3)', textDecoration: 'none' }}>
          ← Back to site
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/admin/auth/logout', { method: 'POST' })
            window.location.href = '/admin/login'
          }}
          style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(220,38,38,0.6)', cursor: 'pointer', textAlign: 'left' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
