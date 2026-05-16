'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '640px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Hero background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=90')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: loaded ? 'scale(1)' : 'scale(1.04)',
          transition: 'transform 8s ease',
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(28,12,6,0.55) 0%, rgba(44,24,16,0.72) 60%, rgba(28,12,6,0.88) 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 1.5rem',
          maxWidth: '780px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1.1rem',
            border: '1px solid rgba(196,154,26,0.6)',
            background: 'rgba(196,154,26,0.1)',
            backdropFilter: 'blur(4px)',
            borderRadius: '100px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-gold-light)',
          }}
        >
          🌙 &nbsp; Halal Certified &nbsp;·&nbsp; Pondicherry&apos;s Finest
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 7vw, 5rem)',
            color: '#ffffff',
            letterSpacing: '0.06em',
            lineHeight: 1.1,
            textShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ color: 'var(--color-gold-light)' }}>Arabic</span>
          <br />
          Heaven
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.72rem',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          ✦ &nbsp; Mandi &nbsp; ✦
        </p>

        {/* Tagline */}
        <p
          style={{
            fontFamily: 'var(--font-elegant)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.65,
            maxWidth: '520px',
          }}
        >
          Slow-smoked whole Mandi, traditional Mezze and authentic Arabian recipes —
          brought from Sana&apos;a to Pondicherry.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          <Link href="/order" className="btn-gold">
            Order Online
          </Link>
          <Link href="/reservations" className="btn-outline-light">
            Reserve a Table
          </Link>
          <Link href="/menu" className="btn-outline-light">
            View Menu
          </Link>
        </div>
      </div>

      {/* Stats bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          background: 'rgba(28,12,6,0.72)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {[
          { number: '500+', label: 'Happy Guests Daily' },
          { number: '4.9★', label: 'Google Rating' },
          { number: '40+', label: 'Signature Dishes' },
          { number: '100%', label: 'Halal Certified' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              maxWidth: '200px',
              textAlign: 'center',
              padding: '1.1rem 0.5rem',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                color: 'var(--color-gold-light)',
                letterSpacing: '0.04em',
              }}
            >
              {stat.number}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
