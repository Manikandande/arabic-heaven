'use client'

import { ShieldCheck, Flame, Leaf, BookOpen, Zap, Star } from 'lucide-react'

const features = [
  {
    Icon: ShieldCheck,
    accent: '#b8860b',
    bg: 'rgba(184,134,11,0.10)',
    title: '100% Halal Certified',
    description: 'Every ingredient, every dish is strictly halal-certified. We take pride in serving food you can trust completely.',
  },
  {
    Icon: Flame,
    accent: 'var(--color-terra)',
    bg: 'rgba(192,98,42,0.10)',
    title: 'Traditional Mandi Oven',
    description: 'Our meat is slow-smoked in an authentic underground tandoor for 4–6 hours, just as it has been done in Yemen for centuries.',
  },
  {
    Icon: Leaf,
    accent: '#3d7a52',
    bg: 'rgba(61,122,82,0.10)',
    title: 'Fresh Every Day',
    description: 'No frozen ingredients. Our rice, bread, and mezze are prepared fresh each morning using premium imported Arabian spices.',
  },
  {
    Icon: BookOpen,
    accent: 'var(--color-gold)',
    bg: 'rgba(200,150,12,0.10)',
    title: 'Authentic Recipes',
    description: 'Our recipes are passed down through generations of Arabian culinary heritage — unchanged, uncompromised, unforgettable.',
  },
  {
    Icon: Zap,
    accent: 'var(--color-terra)',
    bg: 'rgba(192,98,42,0.10)',
    title: 'Fast Delivery',
    description: 'Hot food at your doorstep within 45 minutes across Pondicherry and Villianur. Real-time order tracking included.',
  },
  {
    Icon: Star,
    accent: '#b8860b',
    bg: 'rgba(184,134,11,0.10)',
    title: 'Rated 4.9 on Google',
    description: "Over 500 five-star reviews from happy customers. Pondicherry's most loved Arabic restaurant, year after year.",
  },
]

export default function WhyChooseUs() {
  return (
    <section
      className="section-padding"
      style={{ backgroundColor: 'var(--color-bg-primary)', position: 'relative', overflow: 'hidden' }}
    >
      <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-terra)', marginBottom: '1rem' }}>
            ✦ &nbsp; Why Guests Love Us &nbsp; ✦
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
            The Arabic Heaven Promise
          </h2>
          <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--color-espresso-lt)', marginTop: '0.75rem' }}>
            Six reasons our guests keep coming back, time and again
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {features.map(({ Icon, accent, bg, title, description }) => (
            <PromiseCard key={title} Icon={Icon} accent={accent} bg={bg} title={title} description={description} />
          ))}
        </div>

      </div>
    </section>
  )
}

function PromiseCard({ Icon, accent, bg, title, description }: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  accent: string; bg: string; title: string; description: string
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${accent}`,
        borderRadius: '6px',
        padding: '2rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Icon circle */}
      <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={26} color={accent} strokeWidth={1.6} />
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--color-espresso)', letterSpacing: '0.04em', lineHeight: 1.35 }}>
        {title}
      </h3>

      {/* Divider */}
      <div style={{ width: '36px', height: '2px', backgroundColor: accent, opacity: 0.5, borderRadius: '2px' }} />

      {/* Description */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75 }}>
        {description}
      </p>
    </div>
  )
}
