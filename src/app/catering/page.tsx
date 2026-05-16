'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Packages ─────────────────────────────────────────────────────────────────

const packages = [
  {
    id: 'corporate',
    icon: '🏢',
    title: 'Corporate Package',
    subtitle: 'Team lunches · Iftar dinners · Office events',
    priceFrom: '₹350 per head',
    minGuests: 20,
    includes: [
      'Chicken Mandi or Mutton Kabsa (choice of one)',
      'Grand Mezze Platter (shared)',
      'Arabic Bread & Condiments',
      'Beverages: Laban, Jallab, Water',
      'Disposable serving setup included',
    ],
    highlight: false,
  },
  {
    id: 'celebration',
    icon: '🎉',
    title: 'Celebration Package',
    subtitle: 'Birthdays · Anniversaries · Social gatherings',
    priceFrom: '₹550 per head',
    minGuests: 30,
    includes: [
      'Lamb Mandi (whole) or Mixed Grill Platter',
      'Full Mezze spread (6 items)',
      'Arabic Bread basket',
      'Kunafa or Umm Ali dessert',
      'Arabic Qahwa & Beverages',
      'Setup & serving crew',
    ],
    highlight: true,
  },
  {
    id: 'wedding',
    icon: '💍',
    title: 'Wedding & Walima Package',
    subtitle: 'Nikahs · Receptions · Walima feasts',
    priceFrom: 'Custom quote',
    minGuests: 100,
    includes: [
      'Full Mandi spread: Lamb, Chicken & Mutton',
      'Live Shawarma carving station',
      'Grand Mezze table (10+ items)',
      'Dessert station: Kunafa, Umm Ali, Luqaimat',
      'Arabic Coffee & Dates welcome station',
      'Dedicated catering manager',
      'Setup, service & cleanup crew',
    ],
    highlight: false,
  },
]

// ─── Form types ───────────────────────────────────────────────────────────────

const EVENT_TYPES = ['Corporate / Office', 'Birthday / Anniversary', 'Wedding / Walima', 'Iftar / Ramadan', 'Private Gathering', 'Other']
const BUDGETS = ['Under ₹25,000', '₹25,000 – ₹75,000', '₹75,000 – ₹2,00,000', 'Above ₹2,00,000', 'Prefer custom quote']

interface InquiryForm {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  guestCount: string
  venue: string
  budget: string
  packageId: string
  dietary: string
  message: string
  fileName: string
}

const defaultForm: InquiryForm = {
  name: '', email: '', phone: '',
  eventType: EVENT_TYPES[0], eventDate: '',
  guestCount: '', venue: '',
  budget: BUDGETS[0],
  packageId: '',
  dietary: '',
  message: '',
  fileName: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-espresso)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  padding: '0.65rem 0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--color-espresso-lt)',
  marginBottom: '0.4rem',
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: 'var(--color-gold)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CateringPage() {
  const [form, setForm] = useState<InquiryForm>(defaultForm)
  const [errors, setErrors] = useState<Partial<InquiryForm>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  function update(field: keyof InquiryForm, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function selectPackage(id: string) {
    setForm((p) => ({ ...p, packageId: id }))
    // scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function validate() {
    const errs: Partial<InquiryForm> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile'
    if (!form.eventDate) errs.eventDate = 'Event date is required'
    if (!form.guestCount || isNaN(Number(form.guestCount)) || Number(form.guestCount) < 1) errs.guestCount = 'Enter expected guest count'
    if (!form.message.trim()) errs.message = 'Please describe your event'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1300))
    setSubmitted(true)
    setSubmitting(false)
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0]
  }

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
          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
              ✦ &nbsp; Private Events & Catering &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Catering & Events
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75 }}>
              From intimate family gatherings to grand wedding feasts — we bring the full Arabian dining experience to your venue, with our kitchen, our crew, and our heart.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['20 – 1000+ Guests', '100% Halal', 'Setup & Service Included', 'Pondicherry & Surrounds'].map((tag) => (
                <span key={tag} style={{ fontSize: '0.68rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', padding: '0.3rem 0.8rem', backgroundColor: 'rgba(200,150,12,0.1)', border: '1px solid rgba(200,150,12,0.3)', color: 'var(--color-gold)' }}>
                  ✓ &nbsp;{tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                ✦ &nbsp; Choose a Package
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                Catering Packages
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', marginTop: '0.75rem' }}>
                All packages are fully customisable. Select one to pre-fill the enquiry form, or describe your own requirements below.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="card-arabic"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    border: form.packageId === pkg.id
                      ? '2px solid var(--color-gold)'
                      : pkg.highlight
                      ? '2px solid rgba(200,150,12,0.4)'
                      : '1px solid var(--color-border)',
                    position: 'relative',
                  }}
                >
                  {pkg.highlight && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-1px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--color-gold)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.55rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.9rem',
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div style={{ fontSize: '2.2rem' }}>{pkg.icon}</div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                      {pkg.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                      {pkg.subtitle}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '0.25rem' }}>
                      {pkg.priceFrom}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                      Minimum {pkg.minGuests} guests
                    </p>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                    {pkg.includes.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }}>✓</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => selectPackage(pkg.id)}
                    className={form.packageId === pkg.id ? 'btn-gold' : 'btn-outline'}
                    style={{ fontSize: '0.68rem', padding: '0.55rem', width: '100%', textAlign: 'center' }}
                  >
                    {form.packageId === pkg.id ? '✓ Selected' : 'Select This Package'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '3rem 1.5rem', position: 'relative', overflow: 'hidden' }}
        >
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                ✦ &nbsp; Why Choose Us
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                The Arabic Heaven Catering Difference
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {[
                { icon: '🍖', title: 'Whole Mandi Cooking', body: 'We bring our traditional underground-style cooking method to your venue. No shortcuts.' },
                { icon: '🌙', title: 'Fully Halal', body: 'Every dish prepared under strict Halal guidelines. Certificate available on request.' },
                { icon: '👨‍🍳', title: 'Our Team, Your Venue', body: 'Experienced chefs and serving staff set up and serve — you enjoy the party.' },
                { icon: '🌿', title: 'Fresh on Event Day', body: 'All food prepared on the day of your event. No reheated or pre-cooked batches.' },
                { icon: '🤝', title: 'Dedicated Manager', body: 'A single point of contact manages your order from enquiry to cleanup.' },
                { icon: '📍', title: 'Pondicherry & Beyond', body: 'We cater across Pondicherry, Villianur, Cuddalore, and surrounding areas.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="card-arabic" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>{title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', lineHeight: 1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <div ref={formRef} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
                ✦ &nbsp; Tell Us About Your Event
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                Send an Enquiry
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso-lt)', marginTop: '0.5rem' }}>
                We'll get back with a custom quote within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div
                className="card-arabic"
                style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(200,150,12,0.1)', border: '2px solid rgba(200,150,12,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                  🎉
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                  Enquiry Received!
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75, maxWidth: '380px' }}>
                  Thank you, <strong style={{ color: 'var(--color-espresso)' }}>{form.name}</strong>. Our catering team will review your enquiry and contact you at <strong style={{ color: 'var(--color-gold)' }}>{form.email}</strong> within 24 hours with a detailed quote.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <button onClick={() => { setSubmitted(false); setForm(defaultForm) }} className="btn-outline" style={{ fontSize: '0.72rem', padding: '0.55rem 1.25rem' }}>
                    Submit Another Enquiry
                  </button>
                  <Link href="/" className="btn-gold" style={{ fontSize: '0.72rem', padding: '0.55rem 1.25rem' }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="card-arabic"
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
              >
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                {/* Selected package chip */}
                {form.packageId && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.9rem', backgroundColor: 'rgba(200,150,12,0.08)', border: '1px solid rgba(200,150,12,0.3)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', letterSpacing: '0.06em' }}>
                      ✓ &nbsp;{packages.find(p => p.id === form.packageId)?.title} selected
                    </p>
                    <button type="button" onClick={() => setForm(p => ({ ...p, packageId: '' }))} style={{ background: 'none', border: 'none', color: 'var(--color-espresso-lt)', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
                      Change
                    </button>
                  </div>
                )}

                {/* Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <Field label="Your Name" required error={errors.name}>
                    <input style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-crimson)' : 'var(--color-border)' }} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? 'var(--color-crimson)' : 'var(--color-border)')} />
                  </Field>
                  <Field label="Mobile" required error={errors.phone}>
                    <input style={{ ...inputStyle, borderColor: errors.phone ? 'var(--color-crimson)' : 'var(--color-border)' }} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit number" maxLength={10} onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? 'var(--color-crimson)' : 'var(--color-border)')} />
                  </Field>
                </div>

                <Field label="Email Address" required error={errors.email}>
                  <input type="email" style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-crimson)' : 'var(--color-border)' }} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="your@email.com" onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? 'var(--color-crimson)' : 'var(--color-border)')} />
                </Field>

                {/* Event details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <Field label="Event Type">
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.eventType} onChange={(e) => update('eventType', e.target.value)} onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                      {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Event Date" required error={errors.eventDate}>
                    <input type="date" style={{ ...inputStyle, borderColor: errors.eventDate ? 'var(--color-crimson)' : 'var(--color-border)' }} min={todayISO()} value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = errors.eventDate ? 'var(--color-crimson)' : 'var(--color-border)')} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <Field label="Expected Guest Count" required error={errors.guestCount}>
                    <input type="number" min={1} style={{ ...inputStyle, borderColor: errors.guestCount ? 'var(--color-crimson)' : 'var(--color-border)' }} value={form.guestCount} onChange={(e) => update('guestCount', e.target.value)} placeholder="e.g. 150" onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = errors.guestCount ? 'var(--color-crimson)' : 'var(--color-border)')} />
                  </Field>
                  <Field label="Approximate Budget">
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.budget} onChange={(e) => update('budget', e.target.value)} onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Venue / Location">
                  <input style={inputStyle} value={form.venue} onChange={(e) => update('venue', e.target.value)} placeholder="e.g. Community hall, Home, Marriage hall name" onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                </Field>

                <Field label="Dietary Requirements / Allergies">
                  <input style={inputStyle} value={form.dietary} onChange={(e) => update('dietary', e.target.value)} placeholder="e.g. Nut allergy for 5 guests, extra vegan options needed" onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                </Field>

                <Field label="Tell Us About Your Event" required error={errors.message}>
                  <textarea
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', borderColor: errors.message ? 'var(--color-crimson)' : 'var(--color-border)' }}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="Describe the occasion, your menu preferences, service style (buffet / sit-down), any special requirements…"
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = errors.message ? 'var(--color-crimson)' : 'var(--color-border)')}
                  />
                </Field>

                {/* File upload */}
                <Field label="Inspiration / Venue Photos (Optional)">
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ border: '1px dashed var(--color-border)', padding: '1rem', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--color-bg-tertiary)', transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <p style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>📎</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                      {form.fileName || 'Click to upload photos or PDF inspiration boards'}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--color-espresso-lt)', marginTop: '0.2rem', fontFamily: 'var(--font-body)' }}>JPG, PNG or PDF · Max 10 MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) update('fileName', f.name) }} />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: submitting ? 'rgba(192,98,42,0.5)' : 'var(--color-terra)',
                    color: '#ffffff',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    transition: 'background-color 0.22s ease',
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-terra-dark)' }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-terra)' }}
                >
                  {submitting ? (
                    <>
                      <span style={{ width: '15px', height: '15px', border: '2px solid var(--color-bg-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Sending Enquiry…
                    </>
                  ) : 'Send Catering Enquiry ✦'}
                </button>

                <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
                  We'll respond within 24 hours with a personalised quote. For urgent enquiries, call us or WhatsApp directly.
                </p>
              </form>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
