'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, User, Truck, Package, ChevronRight, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 500

interface SavedAddress {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  pincode: string
  landmark?: string
  is_default: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [orderType, setOrderType]       = useState<'DELIVERY' | 'TAKEAWAY'>('DELIVERY')
  const [name, setName]                 = useState('')
  const [phone, setPhone]               = useState('')
  const [email, setEmail]               = useState('')
  const [notes, setNotes]               = useState('')
  const [paymentMethod]                 = useState<'CASH'>('CASH') // Razorpay coming soon
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [addrLine1, setAddrLine1]  = useState('')
  const [addrLine2, setAddrLine2]  = useState('')
  const [addrCity, setAddrCity]    = useState('')
  const [addrPincode, setAddrPincode] = useState('')
  const [addrLandmark, setAddrLandmark] = useState('')

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name ?? '')
      setPhone(user.user_metadata?.phone ?? '')
      setEmail(user.email ?? '')
    }
  }, [user])

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return
    fetch('/api/addresses')
      .then((r) => r.ok ? r.json() : [])
      .then((data: SavedAddress[]) => {
        setSavedAddresses(data)
        const def = data.find((a) => a.is_default) ?? data[0]
        if (def) setSelectedAddressId(def.id)
      })
      .catch(() => {})
  }, [user])

  const deliveryFee = orderType === 'DELIVERY' ? (totalPrice >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE) : 0
  const total = totalPrice + deliveryFee

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', marginBottom: '0.75rem' }}>Your cart is empty</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-espresso-lt)', marginBottom: '1.5rem' }}>Add dishes from the menu before checking out.</p>
            <Link href="/menu" className="btn-gold" style={{ padding: '0.7rem 1.8rem' }}>Browse Menu</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate address for delivery
    if (orderType === 'DELIVERY') {
      const usingInlineForm = !user || useNewAddress || savedAddresses.length === 0
      const hasAddress = user && selectedAddressId && !useNewAddress
        ? true
        : usingInlineForm && addrLine1.trim() && addrCity.trim() && addrPincode.trim()
      if (!hasAddress) { setError('Please provide a delivery address.'); return }
    }

    setSubmitting(true)

    const payload: Record<string, unknown> = {
      type: orderType,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
    }

    if (orderType === 'DELIVERY') {
      if (user && selectedAddressId && !useNewAddress) {
        payload.addressId = selectedAddressId
      } else {
        payload.addressLine1 = addrLine1
        payload.addressLine2 = addrLine2 || undefined
        payload.city = addrCity
        payload.pincode = addrPincode
        payload.landmark = addrLandmark || undefined
      }
    }

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Order failed')
      clearCart()
      router.push(`/order-confirmation/${data.orderNumber}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--color-espresso)',
    backgroundColor: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-espresso-lt)',
    display: 'block',
    marginBottom: '0.4rem',
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }

  const sectionTitle = (icon: React.ReactNode, text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
      {icon}
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>{text}</h3>
    </div>
  )

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingTop: '72px' }}>

        {/* Page hero */}
        <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.4rem' }}>
              ✦ Arabic Heaven Mandi ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-espresso)', letterSpacing: '0.05em' }}>
              Checkout
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)' }}>
              <Link href="/menu" style={{ color: 'var(--color-terra)', textDecoration: 'none' }}>Menu</Link>
              <ChevronRight size={12} />
              <span>Checkout</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', alignItems: 'start' }} className="checkout-grid">

            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {!user ? (
                /* ── Sign-in gate ── */
                <SignInGate />
              ) : (
                /* ── Checkout form (signed-in only) ── */
                <>
                  {/* Order type */}
                  <div style={sectionStyle}>
                    {sectionTitle(<Truck size={14} color="var(--color-gold)" />, 'Order Type')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {(['DELIVERY', 'TAKEAWAY'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setOrderType(t)}
                          style={{ padding: '0.85rem', borderRadius: '4px', border: `2px solid ${orderType === t ? 'var(--color-gold)' : 'var(--color-border)'}`, backgroundColor: orderType === t ? 'rgba(200,150,12,0.07)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: orderType === t ? 'var(--color-gold)' : 'var(--color-espresso-lt)' }}>
                            {t === 'DELIVERY' ? '🚚 Delivery' : '🏃 Takeaway'}
                          </p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '0.3rem' }}>
                            {t === 'DELIVERY' ? `₹${DELIVERY_FEE} fee · free above ₹${FREE_DELIVERY_ABOVE}` : 'Pick up at restaurant'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div style={sectionStyle}>
                    {sectionTitle(<User size={14} color="var(--color-gold)" />, 'Contact Details')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Phone *</label>
                        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
                    </div>
                  </div>

                  {/* Delivery address */}
                  {orderType === 'DELIVERY' && (
                    <div style={sectionStyle}>
                      {sectionTitle(<MapPin size={14} color="var(--color-gold)" />, 'Delivery Address')}
                      {savedAddresses.length > 0 && !useNewAddress && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {savedAddresses.map((addr) => (
                            <label key={addr.id}
                              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.9rem 1rem', border: `1.5px solid ${selectedAddressId === addr.id ? 'var(--color-gold)' : 'var(--color-border)'}`, borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedAddressId === addr.id ? 'rgba(200,150,12,0.05)' : 'transparent', transition: 'all 0.15s' }}>
                              <input type="radio" name="savedAddress" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} style={{ marginTop: '2px', accentColor: 'var(--color-gold)' }} />
                              <div>
                                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--color-espresso)', marginBottom: '0.2rem' }}>{addr.label}</p>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)', lineHeight: 1.5 }}>
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city} – {addr.pincode}
                                  {addr.landmark ? ` · Near ${addr.landmark}` : ''}
                                </p>
                              </div>
                            </label>
                          ))}
                          <button type="button" onClick={() => setUseNewAddress(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-terra)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            + Use a different address
                          </button>
                        </div>
                      )}
                      {(useNewAddress || savedAddresses.length === 0) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {useNewAddress && (
                            <button type="button" onClick={() => setUseNewAddress(false)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>
                              ← Use a saved address
                            </button>
                          )}
                          <div>
                            <label style={labelStyle}>Address Line 1 *</label>
                            <input required value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} placeholder="House/Flat no., Street name" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Address Line 2</label>
                            <input value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} placeholder="Area, Colony (optional)" style={inputStyle} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                            <div>
                              <label style={labelStyle}>City *</label>
                              <input required value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="Pondicherry" style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Pincode *</label>
                              <input required value={addrPincode} onChange={(e) => setAddrPincode(e.target.value)} placeholder="605001" maxLength={6} style={inputStyle} />
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Landmark (optional)</label>
                            <input value={addrLandmark} onChange={(e) => setAddrLandmark(e.target.value)} placeholder="Near bus stop, temple, etc." style={inputStyle} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special instructions */}
                  <div style={sectionStyle}>
                    {sectionTitle(<Mail size={14} color="var(--color-gold)" />, 'Special Instructions')}
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Allergies, spice level preference, no onions, etc. (optional)"
                      rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                  </div>

                  {/* Payment method */}
                  <div style={sectionStyle}>
                    {sectionTitle(<Phone size={14} color="var(--color-gold)" />, 'Payment Method')}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.9rem 1rem', border: '1.5px solid var(--color-gold)', borderRadius: '4px', backgroundColor: 'rgba(200,150,12,0.05)', cursor: 'pointer' }}>
                        <input type="radio" checked readOnly style={{ accentColor: 'var(--color-gold)' }} />
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--color-espresso)' }}>💵 Cash on Delivery / Pickup</p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '0.2rem' }}>Pay when your order arrives</p>
                        </div>
                      </label>
                      <div style={{ padding: '0.9rem 1rem', border: '1.5px dashed var(--color-border)', borderRadius: '4px', opacity: 0.6 }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--color-espresso-lt)' }}>💳 Online Payment (UPI / Card)</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '0.2rem' }}>Coming soon via Razorpay</p>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'rgba(139,26,42,0.07)', border: '1px solid rgba(139,26,42,0.25)', borderRadius: '4px' }}>
                      <AlertCircle size={16} color="var(--color-crimson)" />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-crimson)' }}>{error}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Right: Order Summary ── */}
            <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>

                {/* Summary header */}
                <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-espresso)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                    Order Summary
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Items */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)', letterSpacing: '0.03em', lineHeight: 1.3 }}>{item.name}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '2px' }}>× {item.quantity}</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--color-gold)', flexShrink: 0 }}>₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)' }}>Subtotal</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--color-espresso)' }}>₹{totalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)' }}>Delivery fee</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: deliveryFee === 0 ? '#3d7a52' : 'var(--color-espresso)' }}>
                      {orderType === 'TAKEAWAY' ? '—' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-gold)' }}>₹{total}</span>
                  </div>
                </div>

                {/* Place order button — only for signed-in users */}
                {user && (
                  <div style={{ padding: '0 1.25rem 1.25rem' }}>
                    <button type="submit" disabled={submitting} className="btn-gold"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.72rem', letterSpacing: '0.15em', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                      {submitting ? 'Placing Order…' : `Place Order · ₹${total}`}
                    </button>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-espresso-lt)', textAlign: 'center', marginTop: '0.6rem', lineHeight: 1.5 }}>
                      By placing your order you agree to our terms. Payment on delivery.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </form>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

function SignInGate() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)',
    borderRadius: '4px', backgroundColor: 'var(--color-bg-primary)', fontFamily: 'var(--font-body)',
    fontSize: '0.88rem', color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.65rem',
    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.4rem',
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message.includes('Invalid') ? 'Incorrect email or password.' : error.message)
    }
    // AuthContext updates automatically — gate disappears on success
  }

  async function handleGoogle() {
    setError('')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=/checkout` },
    })
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--color-espresso)', marginBottom: '0.35rem' }}>
          Sign in to continue
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)' }}>
          Sign in to place your order, save your address, and track deliveries.
        </p>
      </div>

      {/* Google sign-in */}
      <button onClick={handleGoogle} type="button"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso)', marginBottom: '1.25rem' }}>
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)' }}>or sign in with email</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Email + password */}
      {error && (
        <div style={{ padding: '0.65rem 0.9rem', backgroundColor: 'rgba(139,26,42,0.07)', border: '1px solid rgba(139,26,42,0.2)', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-crimson)' }}>{error}</p>
        </div>
      )}
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="btn-gold"
          style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.12em', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)', textAlign: 'center', marginTop: '1.25rem' }}>
        No account?{' '}
        <Link href="/register" style={{ color: 'var(--color-terra)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        {' · '}
        <Link href="/signin" style={{ color: 'var(--color-terra)', textDecoration: 'none' }}>Forgot password?</Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
