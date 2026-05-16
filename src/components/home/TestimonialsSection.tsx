'use client'

const testimonials = [
  {
    name: 'Arjun Krishnamurthy',
    location: 'Pondicherry',
    rating: 5,
    review:
      'The Lamb Mandi here is absolutely out of this world. Tender, smoky, and perfectly spiced. I drive from White Town just for this. Best Arabic food in Puducherry, hands down.',
    date: 'March 2025',
    avatar: 'AK',
  },
  {
    name: 'Fatima Al-Hassan',
    location: 'Villianur',
    rating: 5,
    review:
      'Finally a halal restaurant in Pondicherry that truly understands Arabic cuisine. The Mezze Platter and the Mutton Kabsa brought back memories of home. Authentic and delicious.',
    date: 'April 2025',
    avatar: 'FA',
  },
  {
    name: 'Ravi Shankar',
    location: 'Pondicherry',
    rating: 5,
    review:
      "Ordered online and the food arrived hot in 40 minutes. The Chicken Mandi was exceptional — I've had Mandi in Dubai and this rivals it. Great value for the quality.",
    date: 'February 2025',
    avatar: 'RS',
  },
  {
    name: 'Priya Nair',
    location: 'Puducherry',
    rating: 5,
    review:
      'Celebrated my birthday here. The team was warm, the ambience was stunning, and the food was beyond expectations. The Umm Ali dessert was divine. Will be back!',
    date: 'January 2025',
    avatar: 'PN',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? 'var(--color-gold-light)' : 'rgba(255,255,255,0.15)', fontSize: '0.9rem' }}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section
      className="section-padding"
      style={{ backgroundColor: 'var(--color-espresso)' }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-light)',
              marginBottom: '1rem',
            }}
          >
            ✦ &nbsp; What Our Guests Say &nbsp; ✦
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#ffffff',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
            }}
          >
            Guest Testimonials
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-elegant)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Over 500 five-star reviews on Google — see what our guests are saying.
          </p>
        </div>

        {/* Testimonials grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'background 0.22s, border-color 0.22s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                e.currentTarget.style.borderColor = 'rgba(196,154,26,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              {/* Quote mark */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  color: 'var(--color-gold)',
                  lineHeight: 0.8,
                  marginBottom: '-0.5rem',
                }}
              >
                "
              </div>

              <StarRating count={t.rating} />

              {/* Review text */}
              <p
                style={{
                  fontFamily: 'var(--font-elegant)',
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.75,
                  flex: 1,
                }}
              >
                {t.review}
              </p>

              {/* Reviewer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-terra)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.8rem',
                      color: '#ffffff',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                    {t.location} · {t.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google review CTA */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="https://g.page/r/REPLACE_WITH_YOUR_GOOGLE_PLACE_ID/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-light"
          >
            ⭐ &nbsp; Leave Us a Google Review
          </a>
        </div>
      </div>
    </section>
  )
}
