'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { imgSrc } from '@/lib/imagePath'

const dishes = [
  {
    name: 'Lamb Mandi',
    description: 'Slow-smoked whole lamb leg over fragrant saffron basmati rice, cooked in a traditional underground tandoor.',
    price: '₹580',
    tags: ['Signature', 'Halal'],
    image: '/images/lamb-mandi.jpeg',
  },
  {
    name: 'Chicken Mandi',
    description: 'Tender whole chicken marinated in Yemeni spices, slow-cooked over aromatic basmati rice with caramelised onions.',
    price: '₹380',
    tags: ['Bestseller', 'Halal'],
    image: '/images/chicken-mandi.jpeg',
  },
  {
    name: 'Mezze Platter',
    description: 'A grand spread of Hummus, Mutabbal, Fattoush, Tabbouleh, Pita bread, and Olives. Perfect for sharing.',
    price: '₹320',
    tags: ['Vegan', 'Sharing'],
    image: '/images/Macro_style_Professional_food_photography_202605151911-2.jpeg',
  },
  {
    name: 'Mutton Kabsa',
    description: 'Saudi-style mutton and spiced rice cooked with tomato sauce, dried fruits, and a blend of 12 Arabian spices.',
    price: '₹480',
    tags: ['Signature', 'Halal'],
    image: '/images/Create_images_of_Mandi_biriyani,_202605151907.jpeg',
  },
  {
    name: 'Shawarma Platter',
    description: 'Freshly sliced beef shawarma served with garlic sauce, pickles, fries, and Arabic bread.',
    price: '₹280',
    tags: ['Popular', 'Halal'],
    image: '/images/mixed-grill-platter.jpeg',
  },
  {
    name: 'Falafel & Hummus',
    description: 'Golden crispy falafel with stone-ground hummus, warm pita and a drizzle of extra-virgin olive oil.',
    price: '₹280',
    tags: ['Vegan', 'Vegetarian'],
    image: '/images/Macro_style_Professional_food_photography_202605151909-2.jpeg',
  },
]

const tagColors: Record<string, { bg: string; color: string }> = {
  Signature:  { bg: 'rgba(196,154,26,0.12)',  color: '#8a6800' },
  Bestseller: { bg: 'rgba(192,98,42,0.12)',   color: 'var(--color-terra-dark)' },
  Halal:      { bg: 'rgba(139,26,42,0.1)',    color: 'var(--color-crimson)' },
  Vegan:      { bg: 'rgba(40,120,40,0.1)',    color: '#3a7028' },
  Popular:    { bg: 'rgba(196,154,26,0.10)',  color: '#7a5c00' },
  Sharing:    { bg: 'rgba(80,80,160,0.1)',    color: '#4040a0' },
  Dessert:    { bg: 'rgba(139,26,42,0.1)',    color: 'var(--color-crimson)' },
}

export default function FeaturedDishes() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(3)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Responsive visible count
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1)
      else if (window.innerWidth < 1024) setVisible(2)
      else setVisible(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = dishes.length - visible

  const next = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1))
  }, [maxIndex])

  const prev = () => {
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1))
  }

  const goTo = (i: number) => setCurrent(i)

  // Auto-advance
  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 4500)
    return () => clearInterval(timer)
  }, [paused, next])

  // Card sizing math
  const trackWidthPct = (dishes.length / visible) * 100
  const cardWidthPct = 100 / dishes.length
  const translatePct = -current * cardWidthPct

  return (
    <section
      className="section-padding"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--color-terra)',
            marginBottom: '0.9rem',
          }}>
            ✦ &nbsp; Our Specialities &nbsp; ✦
          </p>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'var(--color-espresso)',
            marginBottom: '0.9rem',
            letterSpacing: '0.04em',
          }}>
            Featured Dishes
          </h2>
          <p style={{
            fontFamily: 'var(--font-elegant)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--color-espresso-lt)',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            Crafted from generations-old Arabian recipes, made fresh every day in our kitchen.
          </p>
        </div>

        {/* Carousel */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Prev button */}
          <button
            onClick={prev}
            aria-label="Previous"
            style={{
              position: 'absolute',
              left: '-1.25rem',
              top: '38%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: 'var(--color-espresso)',
              transition: 'all 0.22s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-terra)'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'var(--color-terra)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.color = 'var(--color-espresso)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            ‹
          </button>

          {/* Track */}
          <div style={{ overflow: 'hidden' }}>
            <div
              ref={trackRef}
              style={{
                display: 'flex',
                width: `${trackWidthPct}%`,
                transform: `translateX(${translatePct}%)`,
                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {dishes.map((dish) => (
                <div
                  key={dish.name}
                  style={{ width: `${cardWidthPct}%`, padding: '0 0.6rem' }}
                >
                  <DishCard dish={dish} />
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            aria-label="Next"
            style={{
              position: 'absolute',
              right: '-1.25rem',
              top: '38%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: 'var(--color-espresso)',
              transition: 'all 0.22s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-terra)'
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.borderColor = 'var(--color-terra)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.color = 'var(--color-espresso)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            ›
          </button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: i === current ? 'var(--color-terra)' : 'var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* View full menu CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/menu" className="btn-outline">
            View Full Menu &nbsp; →
          </Link>
        </div>

      </div>
    </section>
  )
}

function DishCard({ dish }: { dish: typeof dishes[0] }) {
  return (
    <div
      className="card-arabic"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
    >
      {/* Image */}
      <div style={{ height: '220px', overflow: 'hidden', backgroundColor: 'var(--color-bg-tertiary)' }}>
        <img
          src={imgSrc(dish.image)}
          alt={dish.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.07)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {dish.tags.map((tag) => {
            const s = tagColors[tag] ?? { bg: 'rgba(196,154,26,0.1)', color: '#8a6800' }
            return (
              <span key={tag} style={{
                fontSize: '0.6rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.18rem 0.5rem',
                backgroundColor: s.bg,
                color: s.color,
                borderRadius: '2px',
              }}>
                {tag}
              </span>
            )
          })}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          color: 'var(--color-espresso)',
          letterSpacing: '0.03em',
        }}>
          {dish.name}
        </h3>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          color: 'var(--color-espresso-lt)',
          lineHeight: 1.7,
          flex: 1,
        }}>
          {dish.description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'auto',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            color: 'var(--color-terra)',
            fontWeight: 600,
          }}>
            {dish.price}
          </span>
          <Link href="/order" className="btn-gold" style={{ fontSize: '0.62rem', padding: '0.42rem 1rem' }}>
            Add to Order
          </Link>
        </div>
      </div>
    </div>
  )
}
