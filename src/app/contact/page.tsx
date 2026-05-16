'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

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

const SUBJECTS = [
  'General Enquiry',
  'Table Reservation',
  'Catering & Events',
  'Feedback',
  'Careers',
  'Other',
]

interface FormState {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function update(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number'
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Please write at least 10 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1100))
    setSent(true)
    setSubmitting(false)
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
              ✦ &nbsp; We'd Love to Hear From You &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Contact Us
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)', maxWidth: '440px', margin: '0 auto' }}>
              Questions, feedback, event enquiries — we read every message and respond within 24 hours.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <style>{`
            @media (min-width: 860px) { .contact-grid { grid-template-columns: minmax(0,1.1fr) 340px !important; } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '1.5rem' }}>

            {/* ─── LEFT: form ──────────────────────────────────────────── */}
            <div>
              {sent ? (
                <div
                  className="card-arabic"
                  style={{
                    padding: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      backgroundColor: 'rgba(200,150,12,0.1)',
                      border: '2px solid rgba(200,150,12,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                    }}
                  >
                    ✓
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
                    Message Received
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', lineHeight: 1.75, maxWidth: '340px' }}>
                    Thank you, <strong style={{ color: 'var(--color-espresso)' }}>{form.name}</strong>. We'll get back to you at <strong style={{ color: 'var(--color-gold)' }}>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' }) }}
                    className="btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.55rem 1.25rem', marginTop: '0.5rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="card-arabic"
                  style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
                >
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-gold)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    Send Us a Message
                  </h2>

                  {/* Name + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Full Name <span style={{ color: 'var(--color-gold)' }}>*</span></label>
                      <input
                        style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Your name"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.name && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.name}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Mobile (Optional)</label>
                      <input
                        style={{ ...inputStyle, borderColor: errors.phone ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="10-digit number"
                        maxLength={10}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.phone && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email Address <span style={{ color: 'var(--color-gold)' }}>*</span></label>
                    <input
                      type="email"
                      style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-crimson)' : 'var(--color-border)' }}
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="your@email.com"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? 'var(--color-crimson)' : 'var(--color-border)')}
                    />
                    {errors.email && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.email}</p>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    >
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>Message <span style={{ color: 'var(--color-gold)' }}>*</span></label>
                    <textarea
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', borderColor: errors.message ? 'var(--color-crimson)' : 'var(--color-border)' }}
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Tell us how we can help…"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = errors.message ? 'var(--color-crimson)' : 'var(--color-border)')}
                    />
                    {errors.message && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '0.9rem',
                      backgroundColor: submitting ? 'rgba(200,150,12,0.5)' : 'var(--color-gold)',
                      color: 'var(--color-bg-primary)',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      transition: 'background-color 0.22s ease',
                    }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-gold-light)' }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-gold)' }}
                  >
                    {submitting ? (
                      <>
                        <span style={{ width: '15px', height: '15px', border: '2px solid var(--color-bg-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Sending…
                      </>
                    ) : 'Send Message ✦'}
                  </button>
                </form>
              )}
            </div>

            {/* ─── RIGHT: info + map ───────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Contact details */}
              <div className="card-arabic" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.25rem' }}>
                  Get in Touch
                </h3>
                {[
                  { icon: '📍', label: 'Address', value: '1, By-Pass Road, Ariyapalayam, Villianur, Puducherry – 605110' },
                  { icon: '📞', label: 'Phone', value: '+91 79426 96368', href: 'tel:+917942696368' },
                  { icon: '📧', label: 'Email', value: 'hello@arabicheaven.com', href: 'mailto:hello@arabicheaven.com' },
                  { icon: '💬', label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/917942696368' },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '2px' }}>{label}</p>
                      {href ? (
                        <a href={href} style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>{value}</a>
                      ) : (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <div className="card-arabic" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.9rem' }}>
                  Opening Hours
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { day: 'Monday – Friday', time: '11:00 AM – 11:00 PM' },
                    { day: 'Saturday',        time: '10:00 AM – 11:30 PM' },
                    { day: 'Sunday',          time: '10:00 AM – 10:30 PM' },
                  ].map(({ day, time }) => (
                    <li key={day} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{day}</span>
                      <span style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map — OpenStreetMap embed (free, no API key) */}
              <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                    📍 &nbsp; Find Us
                  </p>
                </div>
                <iframe
                  title="Arabic Heaven Mandi — Pondicherry location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=79.7450,11.9450,79.8050,11.9900&layer=mapnik&marker=11.9678,79.7668"
                  width="100%"
                  height="220"
                  style={{ display: 'block', border: 'none', filter: 'invert(0.85) hue-rotate(180deg)' }}
                  loading="lazy"
                />
                <div style={{ padding: '0.55rem 1rem', backgroundColor: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                  <a
                    href="https://www.openstreetmap.org/?mlat=11.9678&mlon=79.7668#map=15/11.9678/79.7668"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.7rem', color: 'var(--color-gold)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                  >
                    Open in Maps →
                  </a>
                </div>
              </div>

              {/* Second location */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(200,150,12,0.05)',
                  border: '1px solid rgba(200,150,12,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                  Also in Villianur
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                  Our second location serves the Villianur community with the same kitchen and same standards.
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-espresso)', fontFamily: 'var(--font-body)' }}>
                  📍 1, By-Pass Road, Ariyapalayam, Villianur, Puducherry – 605110
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
