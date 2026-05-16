'use client'

import Link from 'next/link'

const offers = [
  {
    badge: 'Today Only',
    badgeColor: { bg: 'rgba(139,26,42,0.1)', color: 'var(--color-crimson)' },
    title: 'Lamb Mandi Family Feast',
    description: 'Full Lamb Mandi + 4 sides + 4 soft drinks. Feeds 5–6 people. Order before 8 PM.',
    originalPrice: '₹1,800',
    offerPrice: '₹1,399',
    saving: 'Save ₹401',
    icon: '🍖',
    tag: 'Offer of the Day',
    href: '/order',
    accent: 'var(--color-crimson)',
    highlight: true,
  },
  {
    badge: 'Weekdays',
    badgeColor: { bg: 'rgba(196,154,26,0.12)', color: 'var(--color-gold-muted)' },
    title: 'Business Lunch Deal',
    description: 'Chicken Mandi (half) + Tabbouleh + Pita + Water. Mon–Fri, 11 AM – 3 PM only.',
    originalPrice: '₹520',
    offerPrice: '₹380',
    saving: 'Save ₹140',
    icon: '🕐',
    tag: 'Lunch Special',
    href: '/order',
    accent: 'var(--color-gold)',
    highlight: false,
  },
  {
    badge: 'Always On',
    badgeColor: { bg: 'rgba(40,120,40,0.1)', color: '#3a7028' },
    title: 'Veg Mezze Platter',
    description: 'Hummus, Mutabbal, Fattoush, Tabbouleh, Pita & Olives for two. 100% plant-based.',
    originalPrice: '₹400',
    offerPrice: '₹320',
    saving: 'Save ₹80',
    icon: '🥙',
    tag: 'Vegan Friendly',
    href: '/order',
    accent: '#3a7028',
    highlight: false,
  },
  {
    badge: 'Weekend',
    badgeColor: { bg: 'rgba(192,98,42,0.1)', color: 'var(--color-terra-dark)' },
    title: 'Saturday Grills Night',
    description: 'Mixed Grill Platter (Shish Tawook + Lamb Kafta + Shish Kebab) with Garlic Sauce & Bread.',
    originalPrice: '₹750',
    offerPrice: '₹580',
    saving: 'Save ₹170',
    icon: '🔥',
    tag: 'Weekend Special',
    href: '/order',
    accent: 'var(--color-terra)',
    highlight: false,
  },
]

export default function OffersSection() {
  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--color-terra)',
            marginBottom: '0.9rem',
          }}>
            ✦ &nbsp; Limited Time &nbsp; ✦
          </p>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'var(--color-espresso)',
            marginBottom: '0.9rem',
            letterSpacing: '0.04em',
          }}>
            Offers & Deals
          </h2>
          <p style={{
            fontFamily: 'var(--font-elegant)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--color-espresso-lt)',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            Special prices on our most-loved dishes — available for a limited time.
          </p>
        </div>

        {/* Offer of the Day — full width banner */}
        <OfferBanner offer={offers[0]} />

        {/* 3-column cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}>
          {offers.slice(1).map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </div>

      </div>
    </section>
  )
}

function OfferBanner({ offer }: { offer: typeof offers[0] }) {
  return (
    <div
      className="card-arabic"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(139,26,42,0.04) 0%, rgba(253,246,238,1) 60%)',
        borderLeft: '4px solid var(--color-crimson)',
        flexWrap: 'wrap',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '3.5rem', flexShrink: 0 }}>{offer.icon}</div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.58rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.6rem',
            backgroundColor: offer.badgeColor.bg,
            color: offer.badgeColor.color,
            borderRadius: '2px',
          }}>
            {offer.badge}
          </span>
          <span style={{
            fontSize: '0.58rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.6rem',
            backgroundColor: 'rgba(139,26,42,0.06)',
            color: 'var(--color-crimson)',
            borderRadius: '2px',
          }}>
            {offer.tag}
          </span>
        </div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          color: 'var(--color-espresso)',
          letterSpacing: '0.03em',
          marginBottom: '0.4rem',
        }}>
          {offer.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          color: 'var(--color-espresso-lt)',
          lineHeight: 1.65,
          marginBottom: '0',
        }}>
          {offer.description}
        </p>
      </div>

      {/* Pricing + CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            color: 'var(--color-espresso-lt)',
            textDecoration: 'line-through',
            display: 'block',
          }}>
            {offer.originalPrice}
          </span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            color: 'var(--color-crimson)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}>
            {offer.offerPrice}
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: '#3a7028',
            fontWeight: 600,
            marginTop: '2px',
          }}>
            {offer.saving}
          </span>
        </div>
        <Link
          href={offer.href}
          className="btn-gold"
          style={{ fontSize: '0.7rem', padding: '0.6rem 1.5rem', whiteSpace: 'nowrap' }}
        >
          Claim Offer →
        </Link>
      </div>
    </div>
  )
}

function OfferCard({ offer }: { offer: typeof offers[0] }) {
  return (
    <div
      className="card-arabic"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: `3px solid ${offer.accent}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '2rem' }}>{offer.icon}</span>
        <span style={{
          fontSize: '0.58rem',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '0.2rem 0.55rem',
          backgroundColor: offer.badgeColor.bg,
          color: offer.badgeColor.color,
          borderRadius: '2px',
        }}>
          {offer.badge}
        </span>
      </div>

      <div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: offer.accent, marginBottom: '0.3rem' }}>
          {offer.tag}
        </p>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          color: 'var(--color-espresso)',
          letterSpacing: '0.03em',
        }}>
          {offer.title}
        </h3>
      </div>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        color: 'var(--color-espresso-lt)',
        lineHeight: 1.65,
        flex: 1,
      }}>
        {offer.description}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-espresso-lt)', textDecoration: 'line-through', display: 'block' }}>
            {offer.originalPrice}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: offer.accent, fontWeight: 600 }}>
            {offer.offerPrice}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#3a7028', fontWeight: 600, marginLeft: '0.4rem' }}>
            {offer.saving}
          </span>
        </div>
        <Link href={offer.href} className="btn-outline" style={{ fontSize: '0.62rem', padding: '0.42rem 1rem' }}>
          Order →
        </Link>
      </div>
    </div>
  )
}
