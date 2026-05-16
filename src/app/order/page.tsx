'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrderSummaryPanel from '@/components/order/OrderSummaryPanel'
import { useCart } from '@/context/CartContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type Fulfillment = 'delivery' | 'pickup'
type PaymentMethod = 'online' | 'cod' | 'cop'

interface ContactForm {
  name: string
  phone: string
  email: string
}

interface DeliveryForm {
  street: string
  area: string
  city: string
  pincode: string
  landmark: string
}

interface PickupForm {
  name: string
  phone: string
  idDocName: string
}

// ─── Shared field style ───────────────────────────────────────────────────────

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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: 'var(--color-gold)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="card-arabic"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.72rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Mock promo codes ─────────────────────────────────────────────────────────

const PROMO_CODES: Record<string, number> = {
  WELCOME10: 100,
  MANDI50: 50,
  HALAL20: 200,
}

const DELIVERY_FEE = 49

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()

  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery')
  const [contact, setContact] = useState<ContactForm>({ name: '', phone: '', email: '' })
  const [delivery, setDelivery] = useState<DeliveryForm>({ street: '', area: '', city: 'Pondicherry', pincode: '', landmark: '' })
  const [pickup, setPickup] = useState<PickupForm>({ name: '', phone: '', idDocName: '' })
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<string | null>(null)
  const [promoError, setPromoError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online')
  const [submitting, setSubmitting] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const promoDiscount = promoApplied ? (PROMO_CODES[promoApplied] ?? 0) : 0

  // ── Input handlers ──────────────────────────────────────────────────────────

  const onContact = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContact((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }, [])

  const onDelivery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDelivery((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }, [])

  const onPickup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPickup((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }, [])

  // ── Promo code ──────────────────────────────────────────────────────────────

  function applyPromo() {
    const code = promoCode.trim().toUpperCase()
    if (!code) return
    if (PROMO_CODES[code] !== undefined) {
      setPromoApplied(code)
      setPromoError('')
    } else {
      setPromoApplied(null)
      setPromoError('Invalid or expired promo code.')
    }
  }

  function removePromo() {
    setPromoApplied(null)
    setPromoCode('')
    setPromoError('')
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!contact.name.trim()) errs.name = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(contact.phone)) errs.phone = 'Enter a valid 10-digit mobile number'
    if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) errs.email = 'Enter a valid email address'

    if (fulfillment === 'delivery') {
      if (!delivery.street.trim()) errs.street = 'Street address is required'
      if (!delivery.area.trim()) errs.area = 'Area is required'
      if (!/^\d{6}$/.test(delivery.pincode)) errs.pincode = 'Enter a valid 6-digit pincode'
    } else {
      if (!pickup.name.trim()) errs.pickupName = 'Pickup person name is required'
      if (!/^[6-9]\d{9}$/.test(pickup.phone)) errs.pickupPhone = 'Enter a valid 10-digit mobile number'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handlePlaceOrder() {
    if (items.length === 0) return
    if (!validate()) return

    setSubmitting(true)
    // Simulate network delay; replace with actual API call later
    await new Promise((r) => setTimeout(r, 1400))
    const num = `AH${Date.now().toString().slice(-6)}`
    setOrderNumber(num)
    setPlaced(true)
    clearCart()
    setSubmitting(false)
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────

  if (!placed && items.length === 0) {
    return (
      <>
        <Navbar />
        <main
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            paddingTop: '5rem',
          }}
        >
          <span style={{ fontSize: '4rem' }}>🛒</span>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              color: 'var(--color-espresso)',
              letterSpacing: '0.04em',
            }}
          >
            Your cart is empty
          </h1>
          <p style={{ color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            Add some dishes from our menu before checking out.
          </p>
          <Link href="/menu" className="btn-gold" style={{ padding: '0.7rem 1.75rem' }}>
            Browse Menu →
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  // ── Order placed success screen ─────────────────────────────────────────────

  if (placed) {
    return (
      <>
        <Navbar />
        <main
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8rem 1.5rem 4rem',
            textAlign: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Ornamental success */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(37,211,102,0.12)',
              border: '2px solid rgba(37,211,102,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            ✓
          </div>

          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
            }}
          >
            ✦ &nbsp; Order Confirmed &nbsp; ✦
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              color: 'var(--color-espresso)',
              letterSpacing: '0.04em',
            }}
          >
            Thank you for your order!
          </h1>

          <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-espresso-lt)', maxWidth: '420px' }}>
            "Every meal, a feast. Every visit, a memory."
          </p>

          <div
            className="card-arabic"
            style={{ padding: '1.25rem 2rem', marginTop: '0.5rem', minWidth: '280px' }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', marginBottom: '0.5rem' }}>
              Order Reference
            </p>
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                color: 'var(--color-gold)',
                letterSpacing: '0.1em',
              }}
            >
              #{orderNumber}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '0.5rem',
              maxWidth: '360px',
              width: '100%',
            }}
          >
            {[
              { icon: '📧', text: 'Confirmation email sent to your inbox' },
              { icon: '💬', text: 'WhatsApp updates at every status change' },
              { icon: fulfillment === 'delivery' ? '🛵' : '🏪', text: fulfillment === 'delivery' ? 'Estimated delivery: 35–50 minutes' : 'Ready for pickup in 25–35 minutes' },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="btn-outline" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>
              Back to Home
            </Link>
            <Link href="/menu" className="btn-gold" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>
              Order Again →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Main checkout form ──────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '5rem' }}>

        {/* Page header */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.62rem',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              marginBottom: '0.5rem',
            }}
          >
            ✦ &nbsp; Checkout &nbsp; ✦
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              color: 'var(--color-espresso)',
              letterSpacing: '0.05em',
            }}
          >
            Place Your Order
          </h1>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2.5rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr)',
            gap: '2rem',
          }}
        >
          <style>{`
            @media (min-width: 900px) {
              .order-grid { grid-template-columns: minmax(0,1.4fr) 380px !important; }
            }
          `}</style>
          <div className="order-grid" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0,1fr)' }}>

            {/* ─── LEFT: Form ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* 1. Fulfillment */}
              <SectionCard title="1 · How would you like your order?">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {(['delivery', 'pickup'] as Fulfillment[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFulfillment(type)
                        setPaymentMethod(type === 'pickup' ? 'cop' : 'online')
                      }}
                      style={{
                        padding: '1.1rem',
                        border: `2px solid ${fulfillment === type ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        backgroundColor: fulfillment === type ? 'rgba(200,150,12,0.08)' : 'var(--color-bg-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{type === 'delivery' ? '🛵' : '🏪'}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.72rem',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: fulfillment === type ? 'var(--color-gold)' : 'var(--color-espresso-lt)',
                        }}
                      >
                        {type === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                        {type === 'delivery' ? `₹${DELIVERY_FEE} delivery fee` : 'Free · Ready in 25–35 min'}
                      </span>
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* 2. Contact details */}
              <SectionCard title="2 · Contact Details">
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <Field label="Full Name" required>
                    <input
                      style={{ ...inputStyle, borderColor: errors.name ? 'var(--color-crimson)' : 'var(--color-border)' }}
                      name="name"
                      value={contact.name}
                      onChange={onContact}
                      placeholder="Your full name"
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? 'var(--color-crimson)' : 'var(--color-border)')}
                    />
                    {errors.name && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.name}</p>}
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Field label="Mobile Number" required>
                      <input
                        style={{ ...inputStyle, borderColor: errors.phone ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        name="phone"
                        value={contact.phone}
                        onChange={onContact}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.phone ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.phone && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.phone}</p>}
                    </Field>
                    <Field label="Email (for receipt)">
                      <input
                        style={{ ...inputStyle, borderColor: errors.email ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        name="email"
                        type="email"
                        value={contact.email}
                        onChange={onContact}
                        placeholder="optional"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.email && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.email}</p>}
                    </Field>
                  </div>
                </div>
              </SectionCard>

              {/* 3a. Delivery address */}
              {fulfillment === 'delivery' && (
                <SectionCard title="3 · Delivery Address">
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <Field label="Street & Door Number" required>
                      <input
                        style={{ ...inputStyle, borderColor: errors.street ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        name="street"
                        value={delivery.street}
                        onChange={onDelivery}
                        placeholder="e.g. 14B, Gandhi Road"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.street ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.street && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.street}</p>}
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label="Area / Locality" required>
                        <input
                          style={{ ...inputStyle, borderColor: errors.area ? 'var(--color-crimson)' : 'var(--color-border)' }}
                          name="area"
                          value={delivery.area}
                          onChange={onDelivery}
                          placeholder="e.g. White Town"
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = errors.area ? 'var(--color-crimson)' : 'var(--color-border)')}
                        />
                        {errors.area && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.area}</p>}
                      </Field>
                      <Field label="Pincode" required>
                        <input
                          style={{ ...inputStyle, borderColor: errors.pincode ? 'var(--color-crimson)' : 'var(--color-border)' }}
                          name="pincode"
                          value={delivery.pincode}
                          onChange={onDelivery}
                          placeholder="605001"
                          maxLength={6}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = errors.pincode ? 'var(--color-crimson)' : 'var(--color-border)')}
                        />
                        {errors.pincode && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.pincode}</p>}
                      </Field>
                    </div>

                    <Field label="City">
                      <input
                        style={{ ...inputStyle, opacity: 0.7 }}
                        value="Pondicherry"
                        readOnly
                      />
                    </Field>

                    <Field label="Landmark (Optional)">
                      <input
                        style={inputStyle}
                        name="landmark"
                        value={delivery.landmark}
                        onChange={onDelivery}
                        placeholder="e.g. Near Auroville Gate"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                      />
                    </Field>
                  </div>
                </SectionCard>
              )}

              {/* 3b. Pickup person details */}
              {fulfillment === 'pickup' && (
                <SectionCard title="3 · Pickup Person Details">
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '-0.25rem' }}>
                    Staff will hand the order to this person. Details are kept confidential.
                  </p>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <Field label="Pickup Person's Full Name" required>
                      <input
                        style={{ ...inputStyle, borderColor: errors.pickupName ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        name="name"
                        value={pickup.name}
                        onChange={onPickup}
                        placeholder="Name of person collecting the order"
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.pickupName ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.pickupName && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.pickupName}</p>}
                    </Field>

                    <Field label="Pickup Person's Mobile Number" required>
                      <input
                        style={{ ...inputStyle, borderColor: errors.pickupPhone ? 'var(--color-crimson)' : 'var(--color-border)' }}
                        name="phone"
                        value={pickup.phone}
                        onChange={onPickup}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = errors.pickupPhone ? 'var(--color-crimson)' : 'var(--color-border)')}
                      />
                      {errors.pickupPhone && <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '4px' }}>{errors.pickupPhone}</p>}
                    </Field>

                    <Field label="Identity Document (Optional)">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: '1px dashed var(--color-border)',
                          padding: '1.1rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          transition: 'border-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                      >
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📄</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                          {pickup.idDocName || 'Click to upload Aadhaar / Passport (optional)'}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '0.25rem' }}>
                          JPG, PNG or PDF · Max 5 MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setPickup((p) => ({ ...p, idDocName: file.name }))
                        }}
                      />
                    </Field>

                    {/* Pickup location info */}
                    <div
                      style={{
                        padding: '0.9rem 1rem',
                        backgroundColor: 'rgba(200,150,12,0.06)',
                        border: '1px solid rgba(200,150,12,0.25)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>📍</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--color-gold)', marginBottom: '0.2rem' }}>
                          Pickup Location
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                          Arabic Heaven Mandi, Pondicherry – 605001
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '0.15rem' }}>
                          Open 11 AM – 11 PM · Call: +91 XXXXX XXXXX
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* 4. Promo code */}
              <SectionCard title="4 · Savings (Optional)">
                {promoApplied ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(126,200,126,0.08)',
                      border: '1px solid rgba(126,200,126,0.3)',
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: '#7ec87e', letterSpacing: '0.08em' }}>
                        ✓ &nbsp;{promoApplied} applied
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                        You save ₹{promoDiscount} on this order
                      </p>
                    </div>
                    <button
                      onClick={removePromo}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-espresso-lt)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-body)',
                        textDecoration: 'underline',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError('') }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                      />
                      <button
                        onClick={applyPromo}
                        className="btn-outline"
                        style={{ fontSize: '0.68rem', padding: '0 1.1rem', whiteSpace: 'nowrap' }}
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-crimson)', marginTop: '6px' }}>{promoError}</p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
                      Try: WELCOME10, MANDI50
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* 5. Payment method */}
              <SectionCard title="5 · Payment Method">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(
                    [
                      { id: 'online', label: 'Pay Online', sub: 'UPI · Card · Net Banking via Razorpay', icon: '💳' },
                      ...(fulfillment === 'delivery' ? [{ id: 'cod', label: 'Cash on Delivery', sub: 'Pay the delivery partner when order arrives', icon: '💵' }] : []),
                      ...(fulfillment === 'pickup' ? [{ id: 'cop', label: 'Cash on Pickup', sub: 'Pay at the counter when you collect', icon: '💵' }] : []),
                    ] as { id: PaymentMethod; label: string; sub: string; icon: string }[]
                  ).map(({ id, label, sub, icon }) => (
                    <label
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.9rem',
                        padding: '0.9rem 1rem',
                        border: `1px solid ${paymentMethod === id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        backgroundColor: paymentMethod === id ? 'rgba(200,150,12,0.06)' : 'var(--color-bg-tertiary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id)}
                        style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: paymentMethod === id ? 'var(--color-gold)' : 'var(--color-cream)', letterSpacing: '0.04em' }}>
                          {label}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                          {sub}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Razorpay notice */}
                {paymentMethod === 'online' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>🔒</span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                      Payments are processed securely by Razorpay. We never store your card details.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* Place order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || items.length === 0}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: submitting ? 'rgba(192,98,42,0.5)' : 'var(--color-terra)',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-terra-dark)' }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--color-terra)' }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.7)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Placing Order…
                  </>
                ) : (
                  `${paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order'} ✦`
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
                By placing this order you agree to our{' '}
                <Link href="#" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Terms of Service</Link>
              </p>
            </div>

            {/* ─── RIGHT: Order summary ────────────────────────────────── */}
            <OrderSummaryPanel
              fulfillment={fulfillment}
              promoDiscount={promoDiscount}
              deliveryFee={DELIVERY_FEE}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
