'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

const quickLinks = [
  { label: 'Menu',         href: '/menu' },
  { label: 'Order Online', href: '/order' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Catering',     href: '/catering' },
  { label: 'About Us',     href: '/about' },
  { label: 'Contact',      href: '/contact' },
]

const hours = [
  { day: 'Monday – Friday', time: '11:00 AM – 11:00 PM' },
  { day: 'Saturday',        time: '10:00 AM – 11:30 PM' },
  { day: 'Sunday',          time: '10:00 AM – 10:30 PM' },
]

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-espresso)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Arabesque pattern overlay */}
      <div
        className="pattern-arabesque"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '4rem 1.5rem 2rem',
          position: 'relative',
        }}
      >
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem',
                  color: 'var(--color-gold)',
                  letterSpacing: '0.06em',
                }}
              >
                Arabic Heaven
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.6rem',
                  color: 'var(--color-cream-muted)',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  marginTop: '4px',
                }}
              >
                ✦ &nbsp; Mandi &nbsp; ✦
              </div>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-elegant)',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'var(--color-cream-muted)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              "Every meal, a feast.<br />Every visit, a memory."
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { Icon: InstagramIcon, href: 'https://www.instagram.com/arabicheavenmandi/', label: 'Instagram' },
                { Icon: FacebookIcon,  href: 'https://www.facebook.com/people/Arabic-Heaven-Mandi/61571577514906/', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid var(--color-border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-cream-muted)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-gold)'
                    e.currentTarget.style.color = 'var(--color-gold)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                    e.currentTarget.style.color = 'var(--color-cream-muted)'
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1.25rem',
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--color-cream-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-cream-muted)')}
                  >
                    ›&nbsp; {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1.25rem',
              }}
            >
              Opening Hours
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {hours.map((h) => (
                <li
                  key={h.day}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    fontSize: '0.82rem',
                    color: 'var(--color-cream-muted)',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-body)' }}>{h.day}</span>
                  <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-cream)', whiteSpace: 'nowrap' }}>
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '1.25rem',
              }}
            >
              Contact Us
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { Icon: MapPin, text: '1, By-Pass Road, Ariyapalayam, Villianur, Puducherry – 605110' },
                { Icon: Phone,  text: '+91 XXXXX XXXXX', href: 'tel:+91XXXXXXXXXX' },
                { Icon: Mail,   text: 'hello@arabicheaven.com', href: 'mailto:hello@arabicheaven.com' },
              ].map(({ Icon, text, href }) => (
                <li key={text} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Icon size={15} color="var(--color-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  {href ? (
                    <a
                      href={href}
                      style={{ fontSize: '0.85rem', color: 'var(--color-cream-muted)', textDecoration: 'none' }}
                    >
                      {text}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-cream-muted)' }}>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="divider-ornament" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-gold)' }}>✦</span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-dim)', fontFamily: 'var(--font-body)' }}>
            © {new Date().getFullYear()} Arabic Heaven Mandi. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service'].map((item) => (
              <Link
                key={item}
                href="#"
                style={{ fontSize: '0.78rem', color: 'var(--color-cream-dim)', textDecoration: 'none' }}
              >
                {item}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-cream-dim)', fontFamily: 'var(--font-body)' }}>
            🌙 Halal Certified
          </p>
        </div>
      </div>
    </footer>
  )
}
