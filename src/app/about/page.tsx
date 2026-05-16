import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'The story behind Arabic Heaven Mandi — Pondicherry\'s authentic Arabian restaurant. Traditional recipes, Halal certified, serving since 2018.',
}

const stats = [
  { value: '6+', label: 'Years of Excellence' },
  { value: '40+', label: 'Authentic Dishes' },
  { value: '50,000+', label: 'Happy Guests' },
  { value: '4.9★', label: 'Google Rating' },
]

const values = [
  {
    icon: '🕌',
    title: 'Halal Certified',
    body: 'Every ingredient, every cut of meat, every process in our kitchen follows strict Halal standards. Our certification is renewed annually and displayed at the entrance.',
  },
  {
    icon: '🔥',
    title: 'Traditional Mandi Oven',
    body: 'Our underground tandoor — the heart of true Mandi cooking — slow-smokes meat for 6–8 hours over wood coals, infusing every fibre with the unmistakable aroma of the Arabian Peninsula.',
  },
  {
    icon: '🌿',
    title: 'Farm Fresh Every Day',
    body: 'We source vegetables from local farms around Pondicherry each morning and procure meat fresh daily. No frozen shortcuts.',
  },
  {
    icon: '📜',
    title: 'Generations-Old Recipes',
    body: 'Our recipes travel from Yemen, Saudi Arabia, and the Levant — passed down through families, refined over decades, now brought to Pondicherry unchanged.',
  },
]

const team = [
  {
    emoji: '👨‍🍳',
    name: 'Chef Salam Al-Yemeni',
    role: 'Head Chef & Founder',
    bio: 'Born in Sana\'a, Yemen, Chef Salam mastered the art of Mandi cooking under his grandfather before bringing these traditions to Pondicherry in 2018. He personally oversees every Mandi preparation.',
  },
  {
    emoji: '🧑‍🍳',
    name: 'Chef Riyaz Ahmed',
    role: 'Mezze & Grill Specialist',
    bio: 'With 12 years of experience in Lebanese and Levantine cuisine, Chef Riyaz crafts our Mezze platters, Shawarma, and Grills using hand-ground spice blends prepared fresh each morning.',
  },
  {
    emoji: '👩‍🍳',
    name: 'Chef Nadia',
    role: 'Pastry & Desserts',
    bio: 'Trained in Cairo and Dubai, Nadia brings Egyptian Umm Ali, Kunafa from Nablus, and Luqaimat to life — desserts that end every meal on a note of pure indulgence.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '5rem' }}>

        {/* Hero */}
        <section
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>
              ✦ &nbsp; Our Story &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              About Arabic Heaven
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75 }}>
              "We did not open a restaurant. We opened a window into the Arabian dining table —
              where a meal is never just food, but a reason to gather, to share, and to remember."
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--color-gold)', marginTop: '1rem' }}>
              — Chef Salam Al-Yemeni, Founder
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '2rem 1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--color-border)',
            }}
          >
            {stats.map(({ value, label }) => (
              <div
                key={label}
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-gold)', letterSpacing: '0.04em' }}>{value}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)', marginTop: '0.25rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our story */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                alignItems: 'center',
              }}
            >
              {/* Story text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                    ✦ &nbsp; How It Began
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                    From Sana'a to Pondicherry
                  </h2>
                </div>
                {[
                  'Arabic Heaven Mandi was born in 2018 from a single conviction: that Pondicherry deserved a truly authentic taste of the Arabian Peninsula. Not fusion. Not approximation. The real thing.',
                  'Our founder, Chef Salam, grew up watching his grandfather prepare Mandi in a traditional underground pit in Yemen — a ritual that took the whole day and brought the whole family to the table. He carried that memory across continents to Pondicherry.',
                  'Today, every dish we serve traces back to that kitchen in Sana\'a. The same whole spices, the same patience, the same belief that great food cannot be rushed.',
                  'In 2022 we expanded to our second location in Villianur, bringing the same kitchen and the same commitment to a new neighbourhood. Two restaurants, one standard.',
                ].map((para, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-espresso-lt)', lineHeight: 1.85 }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Visual panel */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  padding: '2.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🕌</div>
                  <div className="divider-ornament" style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-gold)' }}>✦</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-gold)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                    Arabic Heaven
                  </p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)' }}>
                    ✦ &nbsp; Mandi &nbsp; ✦
                  </p>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.2)' }}>
                    <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--color-espresso-lt)', lineHeight: 1.7 }}>
                      Established 2018 · Pondicherry<br />
                      Expanded 2022 · Villianur<br />
                      🌙 Halal Certified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our values */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-secondary)', position: 'relative', overflow: 'hidden' }}>
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                ✦ &nbsp; What We Stand For
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                Our Commitments
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {values.map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="card-arabic"
                  style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                >
                  <div style={{ fontSize: '2.2rem' }}>{icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso-lt)', lineHeight: 1.8 }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the team */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                ✦ &nbsp; The People Behind the Food
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                Meet Our Chefs
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {team.map(({ emoji, name, role, bio }) => (
                <div key={name} className="card-arabic" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '2px solid var(--color-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.8rem',
                    }}
                  >
                    {emoji}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      {name}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                      {role}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--color-espresso-lt)', lineHeight: 1.8 }}>
                    {bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Halal certification banner */}
        <section
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '3rem 1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>🌙</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
              100% Halal — Not a Claim, a Promise
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-espresso-lt)', lineHeight: 1.85, maxWidth: '560px' }}>
              Every meat product we use is certified Halal and sourced from registered suppliers.
              Our kitchen is entirely Halal — no cross-contamination, no exceptions.
              Our certificate is renewed annually and is available for inspection at any time.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.7rem 1.5rem',
                border: '1px solid rgba(200,150,12,0.4)',
                backgroundColor: 'rgba(200,150,12,0.06)',
              }}
            >
              <span style={{ fontSize: '1rem' }}>✓</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Halal Certified · Renewed 2025
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
              ✦ &nbsp; Come Visit Us
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
              Experience it yourself
            </h2>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)' }}>
              Words can only say so much. A table, a meal, and the aroma of slow-smoked Mandi will say the rest.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/reservations" className="btn-gold" style={{ padding: '0.75rem 1.75rem' }}>
                Reserve a Table →
              </Link>
              <Link href="/menu" className="btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
                View Our Menu
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
