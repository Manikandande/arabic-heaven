'use client'

const features = [
  {
    icon: '🌙',
    accent: '#b8860b',
    title: '100% Halal Certified',
    description: 'Every ingredient, every dish is strictly halal-certified. We take pride in serving food you can trust completely.',
  },
  {
    icon: '🔥',
    accent: 'var(--color-terra)',
    title: 'Traditional Mandi Oven',
    description: 'Our meat is slow-smoked in an authentic underground tandoor for 4–6 hours, just as it has been done in Yemen for centuries.',
  },
  {
    icon: '🌿',
    accent: '#3d7a52',
    title: 'Fresh Every Day',
    description: 'No frozen ingredients. Our rice, bread, and mezze are prepared fresh each morning using premium imported Arabian spices.',
  },
  {
    icon: '🏺',
    accent: 'var(--color-gold)',
    title: 'Authentic Recipes',
    description: 'Our recipes are passed down through generations of Arabian culinary heritage — unchanged, uncompromised, unforgettable.',
  },
  {
    icon: '🚀',
    accent: 'var(--color-terra)',
    title: 'Fast Delivery',
    description: 'Hot food at your doorstep within 45 minutes across Pondicherry and Villianur. Real-time order tracking included.',
  },
  {
    icon: '⭐',
    accent: '#b8860b',
    title: 'Rated 4.9 on Google',
    description: "Over 500 five-star reviews from happy customers. Pondicherry's most loved Arabic restaurant, year after year.",
  },
  {
    icon: '🤝',
    accent: '#3d7a52',
    title: 'Warm Hospitality',
    description: 'Rooted in Arabian tradition, every guest is welcomed like family. Our team goes the extra mile to make you feel at home.',
  },
  {
    icon: '🍽️',
    accent: 'var(--color-gold)',
    title: 'Generous Portions',
    description: 'True Arabian generosity on every plate. Our portions are crafted to satisfy and share — because good food brings people together.',
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
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <PromiseCard key={f.title} {...f} />
          ))}
        </div>

      </div>
    </section>
  )
}

function PromiseCard({ icon, accent, title, description }: { icon: string; accent: string; title: string; description: string }) {
  return (
    <div
      className="card-arabic"
      style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: `3px solid ${accent}`,
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.09)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', color: 'var(--color-espresso)', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
        {title}
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-espresso-lt)', lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  )
}
