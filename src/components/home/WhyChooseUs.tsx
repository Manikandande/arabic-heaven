const features = [
  {
    icon: '🌙',
    title: '100% Halal Certified',
    description: 'Every ingredient, every dish is strictly halal-certified. We take pride in serving food you can trust completely.',
  },
  {
    icon: '🔥',
    title: 'Traditional Mandi Oven',
    description: 'Our meat is slow-smoked in an authentic underground tandoor for 4–6 hours, just as it has been done in Yemen for centuries.',
  },
  {
    icon: '🌿',
    title: 'Fresh Every Day',
    description: 'No frozen ingredients. Our rice, bread, and mezze are prepared fresh each morning using premium imported Arabian spices.',
  },
  {
    icon: '🏺',
    title: 'Authentic Recipes',
    description: "Our recipes are passed down through generations of Arabian culinary heritage — unchanged, uncompromised, unforgettable.",
  },
  {
    icon: '🚀',
    title: 'Fast Delivery',
    description: 'Hot food at your doorstep within 45 minutes across Pondicherry and Villianur. Real-time order tracking included.',
  },
  {
    icon: '⭐',
    title: 'Rated 4.9 on Google',
    description: 'Over 500 five-star reviews from happy customers. Pondicherry\'s most loved Arabic restaurant, year after year.',
  },
]

export default function WhyChooseUs() {
  return (
    <section
      className="section-padding"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <div
        className="pattern-arabesque"
        style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--color-terra)',
              marginBottom: '1rem',
            }}
          >
            ✦ &nbsp; Why Guests Love Us &nbsp; ✦
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: 'var(--color-espresso)',
              letterSpacing: '0.04em',
            }}
          >
            The Arabic Heaven Promise
          </h2>
        </div>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-arabic"
              style={{ padding: '2rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.92rem',
                  color: 'var(--color-espresso)',
                  letterSpacing: '0.04em',
                  marginBottom: '0.75rem',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-espresso-lt)',
                  lineHeight: 1.7,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
