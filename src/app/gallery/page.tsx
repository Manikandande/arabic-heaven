'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

type Category = 'all' | 'food' | 'interior' | 'events'

interface GalleryItem {
  id: number
  emoji: string
  title: string
  caption: string
  category: Exclude<Category, 'all'>
}

const items: GalleryItem[] = [
  { id: 1,  emoji: '🍖', title: 'Lamb Mandi',         caption: 'Whole slow-smoked lamb leg over saffron basmati, fresh from the underground tandoor.',      category: 'food' },
  { id: 2,  emoji: '🍗', title: 'Chicken Mandi',       caption: 'Whole Yemeni-spiced chicken, caramelised onions, rose water rice.',                          category: 'food' },
  { id: 3,  emoji: '🥗', title: 'Grand Mezze',         caption: 'Hummus, Mutabbal, Fattoush, Tabbouleh, Pita, and Olives — a feast for the senses.',           category: 'food' },
  { id: 4,  emoji: '🍢', title: 'Mixed Grill Platter', caption: 'Lamb chops, chicken tikka, kofta, and seekh — all grilled over charcoal.',                    category: 'food' },
  { id: 5,  emoji: '🌯', title: 'Beef Shawarma',       caption: 'Freshly sliced beef shawarma with garlic sauce, pickles, and crisp fries.',                   category: 'food' },
  { id: 6,  emoji: '🍮', title: 'Umm Ali',             caption: 'Egypt\'s warm bread pudding with cream, pistachios, raisins, and toasted coconut.',           category: 'food' },
  { id: 7,  emoji: '☕', title: 'Arabic Qahwa',         caption: 'Cardamom-spiced Arabic coffee served in traditional dallah, with dates.',                     category: 'food' },
  { id: 8,  emoji: '🫕', title: 'Mutton Kabsa',        caption: 'Saudi-style mutton and rice with dried fruits, tomato sauce, and 12 spices.',                  category: 'food' },
  { id: 9,  emoji: '🥙', title: 'Falafel Plate',       caption: 'Crisp golden falafel with tahini, pickled turnip, and warm pita.',                            category: 'food' },
  { id: 10, emoji: '🍰', title: 'Kunafa',              caption: 'Nablusian-style cheese kunafa soaked in rose water syrup, topped with crushed pistachios.',    category: 'food' },
  { id: 11, emoji: '🕌', title: 'Main Dining Hall',    caption: 'Our main hall seats 80 guests, adorned with hand-carved arabesque panels and warm lanterns.',  category: 'interior' },
  { id: 12, emoji: '🪔', title: 'Evening Ambiance',    caption: 'As the sun sets, our lanterns cast a golden glow across the arabesque archways.',             category: 'interior' },
  { id: 13, emoji: '🌟', title: 'Ornamental Ceiling',  caption: 'Geometric Moorish patterns hand-painted on our ceiling — a tribute to Andalusian artistry.',  category: 'interior' },
  { id: 14, emoji: '🎭', title: 'Private Dining Room', caption: 'Our private room seats up to 20, perfect for intimate family dinners and celebrations.',       category: 'interior' },
  { id: 15, emoji: '🪑', title: 'Courtyard Seating',   caption: 'Open-air courtyard with traditional floor cushions and low brass tables — Arabian style.',     category: 'interior' },
  { id: 16, emoji: '🍽️', title: 'Table Setting',        caption: 'Every table laid with linen and brass — because the setting is part of the meal.',            category: 'interior' },
  { id: 17, emoji: '🎉', title: 'Birthday Celebration', caption: 'We love celebrating with our guests. Birthdays, anniversaries — tell us, we\'ll make it special.', category: 'events' },
  { id: 18, emoji: '💍', title: 'Wedding Catering',    caption: 'We catered the Al-Rashid wedding — 350 guests, a full Mandi spread, a night to remember.',     category: 'events' },
  { id: 19, emoji: '🏢', title: 'Corporate Iftar',     caption: 'Our Ramadan corporate Iftar packages bring teams together over a shared, meaningful meal.',    category: 'events' },
  { id: 20, emoji: '🎊', title: 'Eid Feast',           caption: 'Our Eid special menu draws families from across Pondicherry every year.',                      category: 'events' },
  { id: 21, emoji: '🍛', title: 'Catering Spread',     caption: 'A full Arabian catering spread for a private villa event — 200 guests, 18 dishes.',            category: 'events' },
  { id: 22, emoji: '🤝', title: 'Team Dinner',         caption: 'The perfect venue for team dinners — warm, private, and memorable.',                           category: 'events' },
]

const tabs: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',      label: 'All',      emoji: '✦' },
  { id: 'food',     label: 'Food',     emoji: '🍖' },
  { id: 'interior', label: 'Interior', emoji: '🕌' },
  { id: 'events',   label: 'Events',   emoji: '🎉' },
]

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<Category>('all')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.category === activeTab)

  function openLightbox(item: GalleryItem) {
    setLightbox(item)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightbox(null)
    document.body.style.overflow = ''
  }

  function navigate(dir: 1 | -1) {
    if (!lightbox) return
    const idx = filtered.findIndex((i) => i.id === lightbox.id)
    const next = filtered[(idx + dir + filtered.length) % filtered.length]
    setLightbox(next)
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '5rem' }}>

        {/* Hero */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
              ✦ &nbsp; A Feast for the Eyes &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Our Gallery
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)', maxWidth: '440px', margin: '0 auto' }}>
              Glimpses of our food, our space, and the moments we share with our guests.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 100,
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0.9rem 1.5rem',
          }}
        >
          <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tabs.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.5rem 1.1rem',
                  backgroundColor: activeTab === id ? 'var(--color-terra)' : 'var(--color-bg-card)',
                  color: activeTab === id ? '#ffffff' : 'var(--color-espresso-lt)',
                  border: `1px solid ${activeTab === id ? 'var(--color-terra)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                }}
              >
                {emoji}&nbsp;&nbsp;{label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <section className="section-padding">
          <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem' }}>
              {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              {filtered.map((item) => (
                <GalleryCard key={item.id} item={item} onClick={() => openLightbox(item)} />
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)',
          }}
        >
          {/* Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                width: '32px',
                height: '32px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-espresso-lt)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              ✕
            </button>

            {/* Image area */}
            <div
              style={{
                height: '260px',
                backgroundColor: 'var(--color-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7rem',
                borderBottom: '1px solid var(--color-border)',
                clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)',
              }}
            >
              {lightbox.emoji}
            </div>

            {/* Info */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                }}
              >
                {lightbox.category}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                {lightbox.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75 }}>
                {lightbox.caption}
              </p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)' }}>
              {[{ dir: -1 as const, label: '← Prev' }, { dir: 1 as const, label: 'Next →' }].map(({ dir, label }) => (
                <button
                  key={label}
                  onClick={() => navigate(dir)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRight: dir === -1 ? '1px solid var(--color-border)' : 'none',
                    color: 'var(--color-espresso-lt)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-espresso-lt)')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Gallery card ─────────────────────────────────────────────────────────────

function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.22s ease, transform 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gold)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: '160px',
          backgroundColor: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          borderBottom: '1px solid var(--color-border)',
          transition: 'background-color 0.22s ease',
        }}
      >
        {item.emoji}
      </div>

      {/* Meta */}
      <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
          {item.category}
        </span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', color: 'var(--color-espresso)', letterSpacing: '0.03em' }}>
          {item.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.caption}
        </p>
      </div>
    </div>
  )
}
