import Link from 'next/link'
import { CheckCircle, Clock, Phone } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingTop: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

          {/* Success icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(61,122,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={38} color="#3d7a52" strokeWidth={1.5} />
            </div>
          </div>

          {/* Heading */}
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.75rem' }}>
            ✦ Order Confirmed ✦
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Thank you for your order!
          </h1>
          <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--color-espresso-lt)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Your order has been received and our kitchen is already preparing your food.
          </p>

          {/* Order number card */}
          <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-gold)', borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.5rem' }}>Your Order Number</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-gold)', letterSpacing: '0.08em' }}>{orderNumber}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)', marginTop: '0.5rem' }}>Save this number to track your order status</p>
          </div>

          {/* Info tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--color-terra)" strokeWidth={1.5} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Est. Time</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso-lt)' }}>30–45 minutes</p>
            </div>
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={20} color="var(--color-terra)" strokeWidth={1.5} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Need Help?</p>
              <a href="tel:+917942696368" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-terra)', textDecoration: 'none' }}>+91 79426 96368</a>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/menu" className="btn-gold" style={{ padding: '0.7rem 1.6rem' }}>
              Order More
            </Link>
            <Link href="/" className="btn-outline" style={{ padding: '0.7rem 1.6rem' }}>
              Back to Home
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
