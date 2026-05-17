'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Menu',        href: '/menu' },
  { label: 'Order Online',href: '/menu' },
  { label: 'Reservations',href: '/reservations' },
  { label: 'Catering',    href: '/catering' },
  { label: 'About',       href: '/about' },
  { label: 'Contact',     href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen]           = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const solid = scrolled || !isHome
  const { user, loading, avatarUrl } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.4s ease',
        backgroundColor: solid ? 'rgba(253,246,238,0.97)' : 'transparent',
        borderBottom: solid ? '1px solid var(--color-border)' : '1px solid transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
      }}
    >
      <nav
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-gold)',
                letterSpacing: '0.08em',
              }}
            >
              Arabic Heaven
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                color: solid ? 'var(--color-espresso-lt)' : 'rgba(255,255,255,0.6)',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              ✦ &nbsp; Mandi &nbsp; ✦
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul
          style={{
            listStyle: 'none',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: solid ? 'var(--color-espresso-md)' : 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-terra-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = solid ? 'var(--color-espresso-md)' : 'rgba(255,255,255,0.85)')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Phone */}
          <a
            href="tel:+917092926440"
            style={{
              alignItems: 'center',
              gap: '0.4rem',
              color: solid ? 'var(--color-espresso-md)' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.08em',
            }}
            className="phone-link"
          >
            <Phone size={14} color="var(--color-gold)" />
            +91 70929 26440
          </a>

          {/* Order Now CTA */}
          <Link href="/menu" className="btn-gold" style={{ fontSize: '0.7rem', padding: '0.55rem 1.25rem' }}>
            Order Now
          </Link>

          {/* User auth widget */}
          {!loading && (
            user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: '999px', padding: '0.3rem 0.75rem 0.3rem 0.3rem', cursor: 'pointer', transition: 'border-color 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terra-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                      : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>{(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}</span>
                    }
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.08em', color: solid ? 'var(--color-espresso)' : '#fff', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(user.user_metadata?.full_name as string)?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, minWidth: '180px', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '6px', boxShadow: 'var(--shadow-md)', zIndex: 100, overflow: 'hidden' }}
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--color-espresso)', margin: 0 }}>{user.user_metadata?.full_name || 'My Account'}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.7rem 1rem', background: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso)', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      My Account
                    </Link>
                    <button
                      onClick={() => { createClient().auth.signOut(); setUserMenuOpen(false) }}
                      style={{ width: '100%', padding: '0.7rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-crimson)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--color-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139,26,42,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: solid ? 'var(--color-espresso-md)' : 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-terra-light)'}
                onMouseLeave={(e) => e.currentTarget.style.color = solid ? 'var(--color-espresso-md)' : 'rgba(255,255,255,0.85)'}
              >
                Sign In
              </Link>
            )
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: 'none',
              color: solid ? 'var(--color-espresso)' : '#ffffff',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {open && (
        <div
          style={{
            backgroundColor: 'rgba(253,246,238,0.98)',
            borderTop: '1px solid var(--color-border)',
            padding: '1.5rem',
          }}
        >
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.85rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-espresso-md)',
                    textDecoration: 'none',
                    display: 'block',
                    padding: '0.25rem 0',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '1rem',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Link href="/menu" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
              Order Online
            </Link>
            <Link href="/reservations" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              Reserve
            </Link>
          </div>
        </div>
      )}

    </header>
  )
}
