'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPOSIT = 50
const RESTAURANT_UPI = process.env.NEXT_PUBLIC_RESTAURANT_UPI ?? '7942696368@paytm'
const RESTAURANT_NAME = 'Arabic Heaven Mandi'

const LUNCH_SLOTS  = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00']
const DINNER_SLOTS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
const ALL_SLOTS    = [...LUNCH_SLOTS, ...DINNER_SLOTS]

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  colorScheme: 'light',
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
        {label}
        {required && <span style={{ color: 'var(--color-gold)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-arabic" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-gold)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const router  = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [date, setDate]               = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [partySize, setPartySize]     = useState(2)
  const [name, setName]               = useState('')
  const [phone, setPhone]             = useState('')
  const [email, setEmail]             = useState('')
  const [requests, setRequests]       = useState('')
  const [errors, setErrors]           = useState<Record<string, string>>({})

  // Availability from DB
  const [availMap, setAvailMap]       = useState<Record<string, { count: number; full: boolean }>>({})
  const [availLoading, setAvailLoading] = useState(false)

  // Payment step
  const [step, setStep]               = useState<'form' | 'payment'>('form')
  const [utr, setUtr]                 = useState('')
  const [utrError, setUtrError]       = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [confirmed, setConfirmed]     = useState(false)
  const [reservationId, setReservationId] = useState('')

  // Pre-fill name/email from signed-in user
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name ?? '')
      setEmail(user.email ?? '')
    }
  }, [user])

  // Fetch real availability whenever date changes
  const fetchAvailability = useCallback(async (d: string) => {
    if (!d) return
    setAvailLoading(true)
    try {
      const res = await fetch(`/api/reservations/availability?date=${d}`)
      const data = await res.json()
      setAvailMap(data.slots ?? {})
    } catch {
      setAvailMap({})
    } finally {
      setAvailLoading(false)
    }
  }, [])

  function handleDateChange(d: string) {
    setDate(d)
    setSelectedSlot('')
    setErrors((p) => ({ ...p, date: '', slot: '' }))
    fetchAvailability(d)
  }

  const slots = useMemo(
    () => ALL_SLOTS.map((s) => ({ time: s, full: availMap[s]?.full ?? false })),
    [availMap]
  )

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate() {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Please select a date'
    if (!selectedSlot) errs.slot = 'Please choose a time slot'
    if (!name.trim()) errs.name = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Enter a valid 10-digit mobile number'
    if (email && !/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 1: go to payment ────────────────────────────────────────────────────

  function handleProceedToPayment() {
    if (!validate()) return
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step 2: confirm booking after UPI payment ────────────────────────────────

  async function handleConfirmPayment() {
    if (!utr.trim() || utr.trim().length < 6) {
      setUtrError('Please enter a valid UTR / transaction ID')
      return
    }
    setUtrError('')
    setSubmitting(true)

    const res = await fetch('/api/reservations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date, timeSlot: selectedSlot, partySize,
        name, phone, email, notes: requests,
        utrNumber: utr.trim(),
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setUtrError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    setReservationId(data.reservationId)
    setConfirmed(true)
  }

  // ── Auth loading ─────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-espresso-lt)' }}>Loading…</p>
        </main>
      </>
    )
  }

  // ── Auth gate ────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 1.5rem 4rem' }}>
          <div className="card-arabic" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🕌</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-espresso)', letterSpacing: '0.05em' }}>
              Sign in to Reserve a Table
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso-lt)', lineHeight: 1.7 }}>
              We require a small ₹{DEPOSIT} deposit to confirm your booking. Please sign in to continue.
            </p>
            <Link
              href={`/signin?next=/reservations`}
              className="btn-gold"
              style={{ padding: '0.75rem 2rem', fontSize: '0.78rem', letterSpacing: '0.1em' }}
            >
              Sign In →
            </Link>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" style={{ color: 'var(--color-terra)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Confirmation screen ──────────────────────────────────────────────────────

  if (confirmed) {
    const [y, m, d] = date.split('-')
    const displayDate = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 1.5rem 4rem', textAlign: 'center', gap: '1.25rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(200,150,12,0.1)', border: '2px solid rgba(200,150,12,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
            🕌
          </div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
            ✦ &nbsp; Reservation Received &nbsp; ✦
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>
            Your table is being confirmed
          </h1>
          <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)', maxWidth: '400px' }}>
            We will verify your payment and confirm your booking within 30 minutes.
          </p>

          <div className="card-arabic" style={{ padding: '1.5rem 2rem', marginTop: '0.5rem', minWidth: '300px', maxWidth: '420px', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.25rem' }}>
              Booking Details
            </p>
            {[
              { icon: '📅', label: 'Date',    value: displayDate },
              { icon: '🕐', label: 'Time',    value: formatTime(selectedSlot) },
              { icon: '👥', label: 'Guests',  value: `${partySize} ${partySize === 1 ? 'person' : 'people'}` },
              { icon: '👤', label: 'Name',    value: name },
              { icon: '💳', label: 'Deposit', value: `₹${DEPOSIT} — Pending verification (UTR: ${utr})` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-espresso)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '0.9rem 1.25rem', backgroundColor: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.2)', maxWidth: '420px', width: '100%', textAlign: 'left' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', lineHeight: 1.6 }}>
              The ₹{DEPOSIT} deposit will be deducted from your final bill. You will receive a WhatsApp confirmation once payment is verified.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="btn-outline" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>Back to Home</Link>
            <Link href="/menu" className="btn-gold" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>View Menu →</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Payment step ─────────────────────────────────────────────────────────────

  if (step === 'payment') {
    const upiLink = `upi://pay?pa=${encodeURIComponent(RESTAURANT_UPI)}&pn=${encodeURIComponent(RESTAURANT_NAME)}&am=${DEPOSIT}&cu=INR&tn=${encodeURIComponent('Table booking deposit')}`
    const [y, m, d] = date.split('-')
    const displayDate = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    })

    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 1.5rem 4rem' }}>
          <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Summary */}
            <div className="card-arabic" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>Booking Summary</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.83rem', fontFamily: 'var(--font-body)', color: 'var(--color-espresso-lt)' }}>
                <span>{displayDate} · {formatTime(selectedSlot)}</span>
                <span>{partySize} {partySize === 1 ? 'guest' : 'guests'}</span>
                <span>{name}</span>
                <span>{phone}</span>
              </div>
            </div>

            {/* UPI Payment */}
            <div className="card-arabic" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                ✦ &nbsp; Pay Deposit &nbsp; ✦
              </p>

              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-espresso)' }}>
                ₹{DEPOSIT}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)' }}>
                Refundable deposit — deducted from your final bill
              </p>

              {/* UPI ID */}
              <div style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)' }}>UPI ID</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>{RESTAURANT_UPI}</p>
              </div>

              {/* Open in UPI app */}
              <a
                href={upiLink}
                className="btn-gold"
                style={{ width: '100%', textAlign: 'center', padding: '0.8rem', fontSize: '0.78rem', letterSpacing: '0.1em', textDecoration: 'none', display: 'block' }}
              >
                Pay ₹{DEPOSIT} via Google Pay / UPI →
              </a>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-espresso-lt)' }}>
                Open your UPI app, pay ₹{DEPOSIT} to the UPI ID above, then enter the transaction ID below.
              </p>
            </div>

            {/* UTR entry */}
            <div className="card-arabic" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                After Payment
              </p>
              <Field label="UTR / Transaction ID" required error={utrError}>
                <input
                  style={{ ...inputStyle, borderColor: utrError ? 'var(--color-crimson)' : 'var(--color-border)' }}
                  value={utr}
                  onChange={(e) => { setUtr(e.target.value); setUtrError('') }}
                  placeholder="e.g. 416123456789"
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = utrError ? 'var(--color-crimson)' : 'var(--color-border)')}
                />
              </Field>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)' }}>
                Find the 12-digit UTR in your UPI app under payment history.
              </p>

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.78rem', letterSpacing: '0.1em', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.6)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Confirming…
                  </>
                ) : 'Confirm Booking ✦'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            <button
              onClick={() => setStep('form')}
              style={{ background: 'none', border: 'none', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center' }}
            >
              ← Back to edit booking
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Booking form ─────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '5rem' }}>

        {/* Page hero */}
        <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
              ✦ &nbsp; Arabic Heaven Mandi &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Reserve a Table
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)', maxWidth: '460px', margin: '0 auto' }}>
              Book your seat for an unforgettable Arabian dining experience.
            </p>
          </div>
        </div>

        {/* Deposit notice */}
        <div style={{ backgroundColor: 'rgba(200,150,12,0.05)', borderBottom: '1px solid rgba(200,150,12,0.15)', padding: '0.65rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)' }}>
            A ₹{DEPOSIT} deposit is required to confirm your booking — it will be deducted from your final bill.
          </p>
        </div>

        {/* Body */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <style>{`
            @media (min-width: 860px) { .res-grid { grid-template-columns: minmax(0,1fr) 320px !important; } }
            input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
          `}</style>
          <div className="res-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '1.5rem' }}>

            {/* ─── LEFT: form ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* 1. Date */}
              <SectionCard title="1 · Select a Date">
                <Field label="Preferred Date" required error={errors.date}>
                  <input
                    type="date"
                    style={{ ...inputStyle, borderColor: errors.date ? 'var(--color-crimson)' : 'var(--color-border)' }}
                    min={todayISO()}
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = errors.date ? 'var(--color-crimson)' : 'var(--color-border)')}
                  />
                </Field>
              </SectionCard>

              {/* 2. Time slot */}
              <SectionCard title="2 · Choose a Time">
                {!date ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '1rem 0' }}>
                    Please select a date first to see available slots.
                  </p>
                ) : availLoading ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '1rem 0' }}>
                    Checking availability…
                  </p>
                ) : (
                  <>
                    {errors.slot && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)' }}>{errors.slot}</p>}

                    {/* Lunch */}
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.6rem' }}>
                        ☀️ &nbsp; Lunch &nbsp; (11 AM – 3 PM)
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                        {slots.filter(s => LUNCH_SLOTS.includes(s.time)).map(({ time, full }) => (
                          <SlotButton key={time} time={time} full={full} selected={selectedSlot === time}
                            onSelect={() => { setSelectedSlot(time); setErrors(p => ({ ...p, slot: '' })) }} />
                        ))}
                      </div>
                    </div>

                    {/* Dinner */}
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.6rem' }}>
                        🌙 &nbsp; Dinner &nbsp; (6 PM – 10 PM)
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                        {slots.filter(s => DINNER_SLOTS.includes(s.time)).map(({ time, full }) => (
                          <SlotButton key={time} time={time} full={full} selected={selectedSlot === time}
                            onSelect={() => { setSelectedSlot(time); setErrors(p => ({ ...p, slot: '' })) }} />
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                      {[
                        { color: 'var(--color-bg-card)',        border: 'var(--color-border)', text: 'Available' },
                        { color: 'rgba(200,150,12,0.12)',       border: 'var(--color-gold)',   text: 'Selected' },
                        { color: 'var(--color-bg-tertiary)',    border: 'var(--color-border)', text: 'Full', dim: true },
                      ].map(({ color, border, text, dim }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '14px', height: '14px', backgroundColor: color, border: `1px solid ${border}`, display: 'inline-block', opacity: dim ? 0.5 : 1 }} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>

              {/* 3. Party size */}
              <SectionCard title="3 · Party Size">
                <div>
                  <p style={{ ...labelStyle, marginBottom: '0.6rem' }}>Number of Guests</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '0.4rem', marginBottom: '0.9rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                      <button key={n} onClick={() => setPartySize(n)} style={{ padding: '0.5rem', border: `1px solid ${partySize === n ? 'var(--color-gold)' : 'var(--color-border)'}`, backgroundColor: partySize === n ? 'rgba(200,150,12,0.12)' : 'var(--color-bg-tertiary)', color: partySize === n ? 'var(--color-gold)' : 'var(--color-espresso-lt)', fontFamily: 'var(--font-heading)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s ease' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => setPartySize(Math.max(1, partySize - 1))} style={{ width: '36px', height: '36px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-espresso)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-gold)', minWidth: '40px', textAlign: 'center' }}>{partySize}</span>
                    <button onClick={() => setPartySize(Math.min(20, partySize + 1))} style={{ width: '36px', height: '36px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-espresso)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{partySize === 1 ? 'person' : 'guests'}</span>
                  </div>
                  {partySize > 10 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', backgroundColor: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.2)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                      For large parties, check our{' '}
                      <Link href="/catering" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Catering & Events</Link>
                      {' '}page for private dining options.
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* 4. Contact */}
              <SectionCard title="4 · Your Details">
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <Field label="Full Name" required error={errors.name}>
                    <input style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-crimson)' : 'var(--color-border)' }} value={name}
                      onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }} placeholder="Your full name"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = errors.name ? 'var(--color-crimson)' : 'var(--color-border)')} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Field label="Mobile Number" required error={errors.phone}>
                      <input style={{ ...inputStyle, borderColor: errors.phone ? 'var(--color-crimson)' : 'var(--color-border)' }} value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }} placeholder="10-digit mobile" maxLength={10}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = errors.phone ? 'var(--color-crimson)' : 'var(--color-border)')} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input type="email" style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-crimson)' : 'var(--color-border)' }} value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }} placeholder="for confirmation"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = errors.email ? 'var(--color-crimson)' : 'var(--color-border)')} />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              {/* 5. Special requests */}
              <SectionCard title="5 · Special Requests (Optional)">
                <div>
                  <label style={labelStyle}>Dietary needs, allergies, celebrations, seating preferences…</label>
                  <textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={4}
                    placeholder="e.g. Window seat preferred, birthday celebration, nut allergy for one guest…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--color-border)')} />
                </div>
                <div>
                  <label style={labelStyle}>Quick add</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['Vegan options needed', 'Gluten-free', 'Nut allergy', 'Birthday celebration', 'Anniversary', 'Window seat', 'Private corner', 'High chair needed'].map((tag) => (
                      <button key={tag} onClick={() => setRequests(p => p ? `${p}, ${tag}` : tag)}
                        style={{ fontSize: '0.68rem', fontFamily: 'var(--font-body)', padding: '0.3rem 0.7rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-espresso-lt)', cursor: 'pointer', transition: 'all 0.18s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-espresso-lt)' }}>
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Proceed button */}
              <button onClick={handleProceedToPayment}
                style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-terra)', color: '#ffffff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background-color 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-terra-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-terra)')}>
                Proceed to Pay ₹{DEPOSIT} Deposit ✦
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
                Free cancellation up to 2 hours before your reservation.
              </p>
            </div>

            {/* ─── RIGHT: info sidebar ─────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div className="card-arabic" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>Opening Hours</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {[
                    { day: 'Mon – Fri', time: '11:00 AM – 11:00 PM' },
                    { day: 'Saturday',  time: '10:00 AM – 11:30 PM' },
                    { day: 'Sunday',    time: '10:00 AM – 10:30 PM' },
                  ].map(({ day, time }) => (
                    <li key={day} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{day}</span>
                      <span style={{ color: 'var(--color-espresso)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-arabic" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>Location</h3>
                {[
                  { icon: '📍', text: '1, By-Pass Road, Ariyapalayam, Villianur, Puducherry – 605110' },
                  { icon: '📞', text: '+91 79426 96368', href: 'tel:+917942696368' },
                  { icon: '💬', text: 'WhatsApp us', href: 'https://wa.me/917942696368' },
                ].map(({ icon, text, href }) => (
                  <div key={text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{icon}</span>
                    {href ? <a href={href} style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>{text}</a>
                           : <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{text}</span>}
                  </div>
                ))}
              </div>

              <div className="card-arabic" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>Good to Know</h3>
                {[
                  { text: 'Free cancellation up to 2 hours before' },
                  { text: 'Tables held for 15 minutes past booking time' },
                  { text: 'Walk-ins welcome, subject to availability' },
                  { text: '100% Halal certified kitchen' },
                  { text: 'Outside food & alcohol not permitted' },
                ].map(({ text }) => (
                  <div key={text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', flexShrink: 0, marginTop: '3px' }}>✓</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{text}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(200,150,12,0.06)', border: '1px solid rgba(200,150,12,0.2)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--color-espresso)', textTransform: 'uppercase' }}>Planning an Event?</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>Private dining & catering for weddings, birthdays, and corporate events.</p>
                <Link href="/catering" className="btn-outline" style={{ fontSize: '0.68rem', padding: '0.5rem 1.2rem' }}>Enquire About Catering →</Link>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Slot button ──────────────────────────────────────────────────────────────

function SlotButton({ time, full, selected, onSelect }: { time: string; full: boolean; selected: boolean; onSelect: () => void }) {
  return (
    <button disabled={full} onClick={onSelect} style={{ padding: '0.45rem 0.25rem', border: `1px solid ${selected ? 'var(--color-gold)' : 'var(--color-border)'}`, backgroundColor: selected ? 'rgba(200,150,12,0.12)' : full ? 'var(--color-bg-tertiary)' : 'var(--color-bg-card)', color: selected ? 'var(--color-gold)' : 'var(--color-espresso-lt)', fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.05em', cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.45 : 1, transition: 'all 0.18s ease', textAlign: 'center' }}>
      {formatTime(time)}
      {full && <span style={{ display: 'block', fontSize: '0.55rem', marginTop: '2px', letterSpacing: '0.1em' }}>FULL</span>}
    </button>
  )
}
