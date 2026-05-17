'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { menuItems, categories } from '@/lib/menuData'

// ─── Types ───────────────────────────────────────────────────────────────────

type CartItem = { id: string; code: string; name: string; price: number; qty: number }

// ─── Constants ───────────────────────────────────────────────────────────────

const ORDER_TYPES = [
  { value: 'DINE_IN',  label: 'Dine-in',  key: 'D' },
  { value: 'TAKEAWAY', label: 'Takeaway', key: 'T' },
  { value: 'DELIVERY', label: 'Delivery', key: 'V' },
]
const PAY_METHODS  = ['CASH', 'UPI', 'CARD']
const PAYMENT_COLOR: Record<string, string> = {
  PAID: '#059669', UNPAID: '#d97706', REFUNDED: '#6366f1', FAILED: '#dc2626',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', PREPARING: '#7c3aed',
  READY: '#059669', DELIVERED: '#64748b', CANCELLED: '#dc2626',
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminBilling() {
  const [bills, setBills]     = useState<any[]>([])
  const [billsLoading, setBillsLoading] = useState(true)
  const [showBills, setShowBills]       = useState(true)

  function loadBills() {
    setBillsLoading(true)
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/admin/billing?date=${today}`)
      .then(r => r.json())
      .then(d => setBills(d.bills ?? []))
      .finally(() => setBillsLoading(false))
  }
  useEffect(() => { loadBills() }, [])

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', minHeight: '100%' }}>

      {/* POS Terminal — always on screen */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <POSTerminal onOrderCreated={loadBills} />
      </div>

      {/* Bills panel — toggleable */}
      <div style={{ width: showBills ? '340px' : '0', flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s ease' }}>
        <BillsPanel bills={bills} loading={billsLoading} onToggle={() => setShowBills(s => !s)} />
      </div>

      {/* Collapsed toggle */}
      {!showBills && (
        <button onClick={() => setShowBills(true)}
          style={{ position: 'fixed', top: '50%', right: '0', transform: 'translateY(-50%)', writingMode: 'vertical-rl', padding: '0.75rem 0.4rem', backgroundColor: '#fff', border: '1px solid #e5ddd5', borderRight: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', cursor: 'pointer', color: '#888', zIndex: 10 }}>
          TODAY'S BILLS ›
        </button>
      )}
    </div>
  )
}

// ─── POS Terminal ─────────────────────────────────────────────────────────────

function POSTerminal({ onOrderCreated }: { onOrderCreated: () => void }) {
  const searchRef   = useRef<HTMLInputElement>(null)
  const orderBtnRef = useRef<HTMLButtonElement>(null)

  const [orderType, setOrderType]   = useState('DINE_IN')
  const [cart, setCart]             = useState<CartItem[]>([])
  const [guestName, setGuestName]   = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [discount, setDiscount]     = useState('')
  const [payMethod, setPayMethod]   = useState('CASH')
  const [payStatus, setPayStatus]   = useState('UNPAID')
  const [notes, setNotes]           = useState('')
  const [catFilter, setCatFilter]   = useState('all')
  const [search, setSearch]         = useState('')
  const [tables, setTables]         = useState<any[]>([])
  const [tableId, setTableId]       = useState('')
  const [creating, setCreating]     = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)

  // Auto-focus search on mount
  useEffect(() => { searchRef.current?.focus() }, [])
  useEffect(() => { fetch('/api/admin/tables').then(r => r.json()).then(d => setTables(d.tables ?? [])) }, [])

  const filtered = useMemo(() => {
    let items = menuItems.filter(i => i.available)
    if (catFilter !== 'all') items = items.filter(i => i.category === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.code.startsWith(q) || i.code === q)
    }
    return items
  }, [catFilter, search])

  // Reset highlight when results change
  useEffect(() => { setHighlightIdx(0) }, [filtered.length, search])

  function addItem(item: typeof menuItems[0]) {
    setCart(c => {
      const ex = c.find(x => x.id === item.id)
      if (ex) return c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { id: item.id, code: item.code, name: item.name, price: item.price, qty: 1 }]
    })
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) setCart(c => c.filter(x => x.id !== id))
    else setCart(c => c.map(x => x.id === id ? { ...x, qty } : x))
  }

  function clearCart() {
    setCart([]); setGuestName(''); setGuestPhone(''); setNotes('')
    setDiscount(''); setTableId(''); setSearch('')
    setTimeout(() => searchRef.current?.focus(), 0)
  }

  // Global keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      // Ctrl+Enter → place order
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); orderBtnRef.current?.click(); return }

      // Ctrl+Backspace → clear cart
      if (e.ctrlKey && e.key === 'Backspace') { e.preventDefault(); clearCart(); return }

      // / or F2 → focus search
      if (!inInput && (e.key === '/' || e.key === 'F2')) {
        e.preventDefault(); searchRef.current?.focus(); setSearch(''); return
      }

      // Esc → clear search if focused, else blur
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch(''); return
      }

      // Alt+D/T/V → order type
      if (e.altKey && e.key === 'd') { e.preventDefault(); setOrderType('DINE_IN'); return }
      if (e.altKey && e.key === 't') { e.preventDefault(); setOrderType('TAKEAWAY'); return }
      if (e.altKey && e.key === 'v') { e.preventDefault(); setOrderType('DELIVERY'); return }

      // Alt+C / Alt+U / Alt+R → payment method
      if (e.altKey && e.key === 'c') { e.preventDefault(); setPayMethod('CASH'); return }
      if (e.altKey && e.key === 'u') { e.preventDefault(); setPayMethod('UPI'); return }
      if (e.altKey && e.key === 'r') { e.preventDefault(); setPayMethod('CARD'); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cart])

  // Search keyboard: Enter adds item, arrows navigate highlight
  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filtered.length - 1)); return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); return
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      addItem(filtered[highlightIdx])
      setSearch('')
      setHighlightIdx(0)
    }
  }

  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discountAmt = Math.min(Number(discount) || 0, subtotal)
  const total       = subtotal - discountAmt

  const createOrder = useCallback(async () => {
    if (!cart.length) { setError('Add at least one item to the order'); return }
    setError(''); setCreating(true)
    const res = await fetch('/api/admin/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: orderType, guestName: guestName || null, guestPhone: guestPhone || null,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        discount: discountAmt, paymentMethod: payMethod, paymentStatus: payStatus,
        tableId: orderType === 'DINE_IN' && tableId ? tableId : undefined,
        notes: notes || null,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setError(data.error ?? 'Failed to create order'); return }

    // Success — reset form, stay on POS
    const msg = `✓ ${data.order.orderNumber}  ·  ₹${data.order.total}  ·  Sent to KOT`
    setSuccess(msg); setTimeout(() => setSuccess(''), 5000)
    clearCart()
    onOrderCreated()
  }, [cart, orderType, guestName, guestPhone, discount, payMethod, payStatus, tableId, notes, discountAmt])

  const activeTables = tables.filter(t => t.isActive)
  const catList      = categories.filter(c => c.id !== 'all')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Billing & POS</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>
            <kbd style={kbdStyle}>/</kbd> search &nbsp;
            <kbd style={kbdStyle}>Enter</kbd> add item &nbsp;
            <kbd style={kbdStyle}>Ctrl+Enter</kbd> place order &nbsp;
            <kbd style={kbdStyle}>Ctrl+⌫</kbd> clear &nbsp;
            <kbd style={kbdStyle}>Alt+D/T/V</kbd> order type
          </p>
        </div>
        {/* Order type */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {ORDER_TYPES.map(t => (
            <button key={t.value} onClick={() => setOrderType(t.value)}
              title={`Alt+${t.key}`}
              style={{ padding: '0.4rem 0.85rem', border: `1px solid ${orderType === t.value ? 'var(--color-espresso)' : '#e5ddd5'}`, backgroundColor: orderType === t.value ? 'var(--color-espresso)' : '#fff', color: orderType === t.value ? '#fff' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
              {t.label} <span style={{ opacity: 0.5, fontSize: '0.55rem' }}>Alt+{t.key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{ backgroundColor: '#05966912', border: '1px solid #05966940', padding: '0.65rem 1rem', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: '#059669', letterSpacing: '0.06em' }}>
          {success}
        </div>
      )}

      {/* Main POS split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '0.75rem', alignItems: 'flex-start' }}>

        {/* LEFT — Menu picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

          {/* Search */}
          <input
            ref={searchRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setHighlightIdx(0) }}
            onKeyDown={onSearchKey}
            placeholder="Search by name or item code… (press / to focus)"
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '2px solid var(--color-gold)', backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box' }}
          />

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <button onClick={() => setCatFilter('all')}
              style={catBtnStyle(catFilter === 'all')}>All</button>
            {catList.map((c, i) => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                title={`Alt+${i + 1}`}
                style={catBtnStyle(catFilter === c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Item grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.45rem', maxHeight: 'calc(100vh - 310px)', overflowY: 'auto', paddingRight: '2px' }}>
            {filtered.map((item, idx) => {
              const inCart    = cart.find(x => x.id === item.id)
              const isHl      = idx === highlightIdx && search.trim().length > 0
              return (
                <button key={item.id} onClick={() => addItem(item)}
                  style={{ textAlign: 'left', padding: '0.65rem 0.75rem', border: `1.5px solid ${isHl ? 'var(--color-espresso)' : inCart ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: isHl ? '#faf6f0' : inCart ? 'rgba(200,150,12,0.07)' : '#fff', cursor: 'pointer', position: 'relative', transition: 'border-color 0.1s' }}>
                  {inCart && (
                    <span style={{ position: 'absolute', top: '5px', right: '5px', width: '19px', height: '19px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {inCart.qty}
                    </span>
                  )}
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', color: 'var(--color-gold)', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{item.code}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--color-espresso)', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.3rem' }}>{item.name}</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--color-gold)' }}>₹{item.price}</p>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#aaa', fontSize: '0.82rem' }}>
                No items match "<strong>{search}</strong>"
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Order panel */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', display: 'flex', flexDirection: 'column', position: 'sticky', top: '0' }}>

          {/* Guest info */}
          <div style={{ padding: '0.85rem', borderBottom: '1px solid #f0ebe5' }}>
            <p style={sectionLabel}>Guest</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Name (Tab to skip)"
                style={panelInput} />
              <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="Phone"
                style={panelInput} />
              {orderType === 'DINE_IN' && activeTables.length > 0 && (
                <select value={tableId} onChange={e => setTableId(e.target.value)} style={panelInput}>
                  <option value="">— Select table —</option>
                  {activeTables.map(t => (
                    <option key={t.id} value={t.id}>Table {t.tableNumber} (seats {t.capacity})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Cart */}
          <div style={{ borderBottom: '1px solid #f0ebe5', minHeight: '120px', maxHeight: '280px', overflowY: 'auto' }}>
            {cart.length === 0
              ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#bbb' }}>Press <kbd style={kbdStyle}>Enter</kbd> after searching to add items</p>
                </div>
              )
              : cart.map(item => (
                <div key={item.id} style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid #faf6f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--color-espresso)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', color: '#888' }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    <button onClick={() => setQty(item.id, item.qty - 1)} style={qtyBtn}>−</button>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', minWidth: '20px', textAlign: 'center', color: 'var(--color-espresso)' }}>{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} style={qtyBtn}>+</button>
                  </div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--color-gold)', minWidth: '44px', textAlign: 'right' }}>₹{item.price * item.qty}</p>
                </div>
              ))
            }
          </div>

          {/* Totals */}
          <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid #f0ebe5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)' }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#888' }}>Discount (₹)</span>
              <input type="number" min={0} max={subtotal} value={discount} onChange={e => setDiscount(e.target.value)}
                placeholder="0"
                style={{ width: '64px', padding: '0.2rem 0.45rem', border: '1px solid #e5ddd5', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: '#059669', textAlign: 'right', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid #e5ddd5' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', color: 'var(--color-espresso)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-gold)' }}>₹{total}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid #f0ebe5' }}>
            <p style={sectionLabel}>Payment method</p>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
              {PAY_METHODS.map((m, i) => (
                <button key={m} onClick={() => setPayMethod(m)} title={`Alt+${['C','U','R'][i]}`}
                  style={{ flex: 1, padding: '0.32rem', border: `1px solid ${payMethod === m ? 'var(--color-espresso)' : '#e5ddd5'}`, backgroundColor: payMethod === m ? 'var(--color-espresso)' : '#fff', color: payMethod === m ? '#fff' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.06em', cursor: 'pointer' }}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {[['UNPAID', 'Pending'], ['PAID', 'Paid Now']].map(([val, label]) => (
                <button key={val} onClick={() => setPayStatus(val)}
                  style={{ flex: 1, padding: '0.32rem', border: `1px solid ${payStatus === val ? (val === 'PAID' ? '#059669' : '#d97706') : '#e5ddd5'}`, backgroundColor: payStatus === val ? (val === 'PAID' ? '#05966910' : '#d9770610') : '#fff', color: payStatus === val ? (val === 'PAID' ? '#059669' : '#d97706') : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid #f0ebe5' }}>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              style={{ ...panelInput, fontSize: '0.76rem' }} />
          </div>

          {/* Error */}
          {error && (
            <p style={{ padding: '0.5rem 0.85rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-crimson)', backgroundColor: 'rgba(139,26,42,0.05)' }}>{error}</p>
          )}

          {/* Place order */}
          <div style={{ padding: '0.85rem' }}>
            <button ref={orderBtnRef} onClick={createOrder} disabled={creating || cart.length === 0}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: cart.length ? 'var(--color-espresso)' : '#d0c8c0', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.14em', cursor: cart.length && !creating ? 'pointer' : 'not-allowed', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Placing Order…' : `Place Order  ₹${total}  Ctrl+↵`}
            </button>
            {cart.length > 0 && (
              <button onClick={clearCart}
                style={{ width: '100%', marginTop: '0.4rem', padding: '0.38rem', border: '1px solid #e5ddd5', backgroundColor: 'transparent', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.1em', cursor: 'pointer', color: '#aaa' }}>
                CLEAR  Ctrl+⌫
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bills panel ─────────────────────────────────────────────────────────────

function BillsPanel({ bills, loading, onToggle }: { bills: any[]; loading: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  async function markPaid(orderId: string) {
    setUpdating(orderId)
    await fetch('/api/admin/billing', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentStatus: 'PAID', paymentMethod: 'CASH' }),
    })
    setUpdating(null)
  }

  const total   = bills.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.total, 0)
  const unpaid  = bills.filter(b => b.paymentStatus === 'UNPAID' && b.status !== 'CANCELLED').length

  return (
    <div style={{ width: '340px', backgroundColor: '#fff', border: '1px solid #e5ddd5', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 4rem)', overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>Today's Bills</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
            {bills.length} orders · ₹{total.toFixed(0)} · {unpaid > 0 ? <span style={{ color: '#d97706' }}>{unpaid} unpaid</span> : 'all paid'}
          </p>
        </div>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem', padding: '0.25rem' }}>✕</button>
      </div>

      {/* Bills list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading
          ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', color: '#888', textAlign: 'center' }}>Loading…</p>
          : bills.length === 0
            ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', color: '#aaa', textAlign: 'center', fontSize: '0.82rem' }}>No orders today yet</p>
            : bills.map(b => (
              <div key={b.id}>
                <div onClick={() => setExpanded(e => e === b.id ? null : b.id)}
                  style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #f0ebe5', cursor: 'pointer', backgroundColor: expanded === b.id ? '#faf6f0' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', color: 'var(--color-espresso)' }}>{b.orderNumber}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#888', marginTop: '1px' }}>
                        {b.guestName ?? 'Walk-in'} · {b.items.length} item{b.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-gold)' }}>₹{b.total.toFixed(0)}</p>
                      <span style={{ fontSize: '0.56rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', padding: '0.12rem 0.35rem', backgroundColor: `${PAYMENT_COLOR[b.paymentStatus]}15`, color: PAYMENT_COLOR[b.paymentStatus], textTransform: 'uppercase' }}>
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
                {expanded === b.id && (
                  <div style={{ padding: '0.5rem 1rem 0.75rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                    {b.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: '#666', padding: '0.2rem 0' }}>
                        <span>{item.qty ?? item.quantity}× {item.name}</span>
                        <span style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-heading)' }}>₹{((item.price ?? item.unitPrice) * (item.qty ?? item.quantity)).toFixed(0)}</span>
                      </div>
                    ))}
                    {b.paymentStatus === 'UNPAID' && b.status !== 'CANCELLED' && (
                      <button onClick={() => markPaid(b.id)} disabled={updating === b.id}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.35rem', backgroundColor: '#059669', color: '#fff', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
                        {updating === b.id ? '…' : '✓ Mark Paid'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
        }
      </div>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const kbdStyle: React.CSSProperties = {
  display: 'inline-block', padding: '0 4px', border: '1px solid #ccc',
  borderRadius: '3px', backgroundColor: '#f5f5f5', fontFamily: 'monospace',
  fontSize: '0.65rem', color: '#555', lineHeight: '1.6',
}
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.15em',
  textTransform: 'uppercase', color: '#aaa', marginBottom: '0.45rem', display: 'block',
}
const panelInput: React.CSSProperties = {
  width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #e5ddd5',
  backgroundColor: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
  color: 'var(--color-espresso)', outline: 'none', boxSizing: 'border-box',
}
const qtyBtn: React.CSSProperties = {
  width: '22px', height: '22px', border: '1px solid #e5ddd5', backgroundColor: '#faf6f0',
  cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: '#666',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
}
function catBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '0.32rem 0.65rem', border: `1px solid ${active ? 'var(--color-gold)' : '#e5ddd5'}`,
    backgroundColor: active ? 'rgba(200,150,12,0.1)' : '#fff',
    color: active ? 'var(--color-gold)' : '#888',
    fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.08em', cursor: 'pointer',
  }
}
