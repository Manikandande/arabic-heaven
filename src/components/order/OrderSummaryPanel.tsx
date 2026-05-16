'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

interface Props {
  fulfillment: 'delivery' | 'pickup'
  promoDiscount: number
  deliveryFee: number
}

const GST_RATE = 0.05

export default function OrderSummaryPanel({ fulfillment, promoDiscount, deliveryFee }: Props) {
  const { items, totalPrice } = useCart()

  const taxableAmount = Math.max(0, totalPrice - promoDiscount)
  const gst = Math.round(taxableAmount * GST_RATE)
  const grandTotal = taxableAmount + (fulfillment === 'delivery' ? deliveryFee : 0) + gst

  return (
    <div
      style={{
        position: 'sticky',
        top: '6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          padding: '1rem 1.25rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
          }}
        >
          ✦ &nbsp; Your Order
        </h2>
      </div>

      {/* Items */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          maxHeight: '280px',
          overflowY: 'auto',
        }}
      >
        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-espresso-lt)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              No items yet.{' '}
              <Link href="/menu" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
                Browse menu →
              </Link>
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      color: 'var(--color-espresso)',
                      letterSpacing: '0.02em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-gold)', flexShrink: 0 }}>
                  ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price breakdown */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {[
          { label: 'Subtotal', value: `₹${totalPrice}` },
          ...(promoDiscount > 0 ? [{ label: 'Promo Discount', value: `−₹${promoDiscount}`, highlight: true }] : []),
          ...(fulfillment === 'delivery' ? [{ label: 'Delivery Fee', value: `₹${deliveryFee}` }] : [{ label: 'Pickup', value: 'Free' }]),
          { label: `GST (${GST_RATE * 100}%)`, value: `₹${gst}` },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
              {label}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-heading)',
                color: highlight ? '#7ec87e' : 'var(--color-cream)',
              }}
            >
              {value}
            </span>
          </div>
        ))}

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-espresso-lt)',
            }}
          >
            Total Payable
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              color: 'var(--color-gold)',
            }}
          >
            ₹{grandTotal}
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: '0.7rem',
          color: 'var(--color-espresso-lt)',
          fontFamily: 'var(--font-body)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        🔒 Secure checkout &nbsp;·&nbsp; 100% Halal
      </p>
    </div>
  )
}
