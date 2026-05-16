'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 200,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100vw)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}
            >
              Your Order
            </h2>
            {totalItems > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-espresso-lt)', marginTop: '2px' }}>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-espresso-lt)',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gold)'
              e.currentTarget.style.color = 'var(--color-gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-espresso-lt)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '1rem',
                color: 'var(--color-espresso-lt)',
              }}
            >
              <span style={{ fontSize: '3rem' }}>🍽️</span>
              <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1rem' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--color-espresso-lt)' }}>
                Add dishes from the menu to get started
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {/* Emoji */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {item.emoji}
                  </div>

                  {/* Name + price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.82rem',
                        color: 'var(--color-espresso)',
                        letterSpacing: '0.03em',
                        marginBottom: '0.3rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)' }}>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  {/* Qty controls + remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-espresso-lt)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.8rem',
                          color: 'var(--color-espresso)',
                          minWidth: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-espresso-lt)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-espresso-lt)',
                        cursor: 'pointer',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-body)',
                        padding: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-crimson)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-espresso-lt)')}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — total + CTA */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-espresso-lt)',
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  color: 'var(--color-gold)',
                }}
              >
                ₹{totalPrice}
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
              Delivery fee, taxes &amp; discounts applied at checkout
            </p>

            <Link
              href="/checkout"
              className="btn-gold"
              onClick={closeCart}
              style={{ textAlign: 'center', display: 'block', padding: '0.8rem' }}
            >
              Proceed to Checkout &nbsp;→
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
