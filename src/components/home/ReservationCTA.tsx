'use client'

import Link from 'next/link'

export default function ReservationCTA() {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-terra)',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle diagonal pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
            letterSpacing: '0.3em',
          }}
        >
          ✦ ✦ ✦
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          Reserve Your Table
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-elegant)',
            fontStyle: 'italic',
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.7,
            marginBottom: '1.75rem',
          }}
        >
          Join us for an unforgettable dining experience. Whether it&apos;s a family feast,
          a romantic evening, or a celebration — we have the perfect table waiting for you.
        </p>

        {/* Info chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          {[
            '🕐  Open 11 AM – 11 PM',
            '👥  Groups Welcome',
            '🎉  Private Events',
            '📞  Instant Confirmation',
          ].map((chip) => (
            <span
              key={chip}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/reservations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 2rem',
              background: '#ffffff',
              color: 'var(--color-terra)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              transition: 'background 0.22s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-cream)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            Book a Table Online
          </Link>
          <a
            href="tel:+917092926440"
            className="btn-outline-light"
          >
            📞 &nbsp; Call to Reserve
          </a>
        </div>
      </div>
    </section>
  )
}
