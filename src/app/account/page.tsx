'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, ShoppingBag, MapPin, Heart, LogOut, Edit2, Check, X,
  Camera, Plus, Star, ChevronDown, ChevronUp, Trash2, Package,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'orders' | 'addresses' | 'favourites'

interface Address {
  id: string
  label: string
  line1: string
  line2?: string | null
  city: string
  pincode: string
  landmark?: string | null
  is_default: boolean
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
  item_rating: number | null
}

interface Order {
  id: string
  order_number: string
  type: string
  status: string
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  rating: number | null
  created_at: string
  items: OrderItem[]
}

interface FavouriteItem {
  id: string
  name: string
  category: string
  price: number
  image_url?: string
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, loading, avatarUrl: ctxAvatarUrl, refreshAvatar } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<Tab>('profile')

  // Profile fields
  const [editing, setEditing]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveMsg, setSaveMsg]           = useState('')
  const [fullName, setFullName]         = useState('')
  const [phone, setPhone]               = useState('')
  const [gender, setGender]             = useState('')
  const [dob, setDob]                   = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Addresses
  const [addresses, setAddresses]         = useState<Address[]>([])
  const [addrLoading, setAddrLoading]     = useState(false)
  const [showAddrForm, setShowAddrForm]   = useState(false)
  const [addrForm, setAddrForm]           = useState({ label: 'Home', line1: '', line2: '', city: '', pincode: '', landmark: '' })
  const [savingAddr, setSavingAddr]       = useState(false)
  const [addrMsg, setAddrMsg]             = useState('')

  // Orders
  const [orders, setOrders]               = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Favourites (stored in user_metadata)
  const [favourites, setFavourites] = useState<FavouriteItem[]>([])

  useEffect(() => {
    if (!loading && !user) router.replace('/signin')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? '')
      setPhone(user.user_metadata?.phone ?? '')
      setGender(user.user_metadata?.gender ?? '')
      setDob(user.user_metadata?.dob ?? '')
      setFavourites(user.user_metadata?.favourites ?? [])
    }
  }, [user])

  useEffect(() => {
    if (tab === 'addresses' && user) fetchAddresses()
  }, [tab, user])

  useEffect(() => {
    if (tab === 'orders' && user) fetchOrders()
  }, [tab, user])

  // ── Avatar ───────────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setSaveMsg('Please upload a JPG, PNG or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) { setSaveMsg('Image must be under 2 MB.'); return }

    setUploadingAvatar(true)
    const supabase = createClient()
    const path = `${user.id}/avatar.${ext}`

    // Upload to PRIVATE bucket — no public access
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) {
      setSaveMsg('Upload failed. Create a private "avatars" bucket in Supabase Storage first.')
      setUploadingAvatar(false)
      return
    }

    // Store only the file path — signed URLs are generated fresh each session
    await supabase.auth.updateUser({ data: { avatar_path: path } })

    // Refresh signed URL in AuthContext (updates navbar + this page instantly)
    await refreshAvatar()
    setUploadingAvatar(false)
    setSaveMsg('Photo updated!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // ── Profile save ─────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true); setSaveMsg('')
    const { error } = await createClient().auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim(), gender, dob },
    })
    setSaving(false)
    if (error) { setSaveMsg('Save failed. Please try again.'); return }
    setSaveMsg('Saved successfully!')
    setEditing(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function handleCancel() {
    setFullName(user?.user_metadata?.full_name ?? '')
    setPhone(user?.user_metadata?.phone ?? '')
    setGender(user?.user_metadata?.gender ?? '')
    setDob(user?.user_metadata?.dob ?? '')
    setEditing(false); setSaveMsg('')
  }

  // ── Addresses ────────────────────────────────────────────────────────────────

  async function fetchAddresses() {
    setAddrLoading(true)
    try {
      const res = await fetch('/api/addresses')
      if (res.ok) setAddresses(await res.json())
    } catch {}
    setAddrLoading(false)
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault(); setSavingAddr(true)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addrForm),
      })
      if (res.ok) {
        const newAddr = await res.json()
        setAddresses((prev) => [...prev, newAddr])
        setShowAddrForm(false)
        setAddrForm({ label: 'Home', line1: '', line2: '', city: '', pincode: '', landmark: '' })
        setAddrMsg('Address saved successfully!')
        setTimeout(() => setAddrMsg(''), 4000)
      } else {
        setAddrMsg('Failed to save address. Please try again.')
      }
    } catch {
      setAddrMsg('Failed to save address. Please try again.')
    }
    setSavingAddr(false)
  }

  async function handleDeleteAddr(id: string) {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    })
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
  }

  // ── Orders ───────────────────────────────────────────────────────────────────

  async function fetchOrders() {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } catch {}
    setOrdersLoading(false)
  }

  async function handleRateOrder(orderId: string, rating: number) {
    await fetch(`/api/orders/${orderId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    })
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, rating } : o))
  }

  async function handleRateItem(orderId: string, itemId: string, item_rating: number) {
    await fetch(`/api/orders/${orderId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemRating: item_rating }),
    })
    setOrders((prev) => prev.map((o) => o.id === orderId
      ? { ...o, items: o.items.map((it) => it.id === itemId ? { ...it, item_rating } : it) }
      : o
    ))
  }

  // ── Favourites ───────────────────────────────────────────────────────────────

  async function handleUnpin(id: string) {
    const updated = favourites.filter((f) => f.id !== id)
    setFavourites(updated)
    await createClient().auth.updateUser({ data: { favourites: updated } })
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--color-espresso-lt)' }}>Loading…</p>
      </main>
    )
  }

  const displayName = fullName || user.user_metadata?.full_name || ''
  const initials    = (displayName || user.email || 'U').slice(0, 2).toUpperCase()
  const avatarSrc   = ctxAvatarUrl

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'profile',    label: 'Profile',    Icon: User },
    { id: 'orders',     label: 'My Orders',  Icon: ShoppingBag },
    { id: 'addresses',  label: 'Addresses',  Icon: MapPin },
    { id: 'favourites', label: 'Favourites', Icon: Heart },
  ]

  const isError = (msg: string) => msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('upload')

  return (
    <>
    <Navbar />
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingTop: '88px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 1.5rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-terra)', marginBottom: '0.3rem' }}>My Account</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-gold)', letterSpacing: '0.06em' }}>Arabic Heaven</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Sidebar ── */}
          <div>
            <div className="card-arabic" style={{ padding: '1.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--color-gold)', overflow: 'hidden', backgroundColor: 'var(--color-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>{initials}</span>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Change photo"
                  style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--color-terra)', border: '2px solid var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={12} color="#fff" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
              {uploadingAvatar && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-terra)', marginBottom: '0.5rem' }}>Uploading…</p>}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{displayName || 'My Account'}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>

            <div className="card-arabic" style={{ overflow: 'hidden' }}>
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: tab === id ? 'var(--color-bg-tertiary)' : 'none', border: 'none', borderLeft: tab === id ? '3px solid var(--color-terra)' : '3px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <Icon size={15} color={tab === id ? 'var(--color-terra)' : 'var(--color-espresso-lt)'} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tab === id ? 'var(--color-terra)' : 'var(--color-espresso-lt)' }}>{label}</span>
                  {id === 'favourites' && favourites.length > 0 && (
                    <span style={{ marginLeft: 'auto', backgroundColor: 'var(--color-terra)', color: '#fff', borderRadius: '999px', fontSize: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 700, padding: '1px 7px' }}>{favourites.length}</span>
                  )}
                </button>
              ))}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
              <button onClick={handleSignOut}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139,26,42,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                <LogOut size={15} color="var(--color-crimson)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-crimson)' }}>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ── Main Panel ── */}
          <div>

            {/* ═══ PROFILE TAB ═══ */}
            {tab === 'profile' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={panelHeading}>Personal Details</h2>
                    <p style={panelSub}>Manage your profile, contact info and birthday</p>
                  </div>
                  {!editing && (
                    <button onClick={() => setEditing(true)} style={editBtnStyle}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terra)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div style={{ backgroundColor: isError(saveMsg) ? 'rgba(139,26,42,0.08)' : 'rgba(34,139,34,0.08)', border: `1px solid ${isError(saveMsg) ? 'rgba(139,26,42,0.25)' : 'rgba(34,139,34,0.25)'}`, borderRadius: '4px', padding: '0.65rem 1rem', marginBottom: '1.25rem' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: isError(saveMsg) ? 'var(--color-crimson)' : '#228B22', margin: 0 }}>{saveMsg}</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <ProfileField label="Full Name">
                    {editing
                      ? <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      : <FieldVal>{fullName || <Unset />}</FieldVal>}
                  </ProfileField>

                  <ProfileField label="Email Address">
                    <FieldVal muted>{user.email}</FieldVal>
                    <p style={hintStyle}>Email cannot be changed here</p>
                  </ProfileField>

                  <ProfileField label="Phone Number">
                    {editing
                      ? <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      : <FieldVal>{phone || <Unset />}</FieldVal>}
                  </ProfileField>

                  <ProfileField label="Gender">
                    {editing
                      ? (
                        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inputStyle, appearance: 'none' as const }} onFocus={focusEl} onBlur={blurEl}>
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="nonbinary">Non-binary</option>
                        </select>
                      )
                      : <FieldVal>{gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender === 'nonbinary' ? 'Non-binary' : <Unset />}</FieldVal>}
                  </ProfileField>

                  <ProfileField label="Date of Birth">
                    {editing
                      ? <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      : <FieldVal>{dob ? new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : <Unset />}</FieldVal>}
                    {!editing && dob && <p style={{ ...hintStyle, color: 'var(--color-terra)' }}>🎂 We&apos;ll send you a birthday treat!</p>}
                  </ProfileField>

                  <ProfileField label="Sign-in Method">
                    <FieldVal>{user.app_metadata?.provider === 'google' ? 'Google Account' : 'Email & Password'}</FieldVal>
                  </ProfileField>

                  <ProfileField label="Member Since">
                    <FieldVal>{new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</FieldVal>
                  </ProfileField>
                </div>

                {editing && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                    <button onClick={handleSave} disabled={saving} className="btn-gold"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', fontSize: '0.7rem', letterSpacing: '0.1em', opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}>
                      <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={handleCancel} style={cancelBtnStyle}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {tab === 'orders' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <h2 style={panelHeading}>My Orders</h2>
                <p style={{ ...panelSub, marginBottom: '1.75rem' }}>Order history, receipts and ratings</p>

                {ordersLoading
                  ? <p style={emptyText}>Loading orders…</p>
                  : orders.length === 0
                  ? (
                    <div style={emptyBox}>
                      <ShoppingBag size={36} color="var(--color-border-strong)" style={{ margin: '0 auto 1rem' }} />
                      <p style={emptyText}>No orders yet</p>
                      <Link href="/menu" className="btn-gold" style={{ fontSize: '0.7rem', padding: '0.6rem 1.5rem', marginTop: '1rem', display: 'inline-flex' }}>Order Now</Link>
                    </div>
                  )
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          expanded={expandedOrder === order.id}
                          onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          onRateOrder={(r) => handleRateOrder(order.id, r)}
                          onRateItem={(itemId, r) => handleRateItem(order.id, itemId, r)}
                        />
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {/* ═══ ADDRESSES TAB ═══ */}
            {tab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card-arabic" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
                    <div>
                      <h2 style={panelHeading}>Saved Addresses</h2>
                      <p style={panelSub}>Delivery addresses for faster checkout</p>
                    </div>
                    <button onClick={() => setShowAddrForm((v) => !v)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', backgroundColor: 'var(--color-terra)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      <Plus size={12} /> Add New
                    </button>
                  </div>

                  {addrLoading
                    ? <p style={emptyText}>Loading…</p>
                    : addresses.length === 0
                    ? (
                      <div style={emptyBox}>
                        <MapPin size={32} color="var(--color-border-strong)" style={{ margin: '0 auto 0.75rem' }} />
                        <p style={emptyText}>No addresses saved</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)', marginTop: '0.4rem' }}>Addresses are also saved automatically when you place a delivery order</p>
                      </div>
                    )
                    : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                        {addresses.map((addr) => (
                          <AddressCard key={addr.id} address={addr} onDelete={() => handleDeleteAddr(addr.id)} onSetDefault={() => handleSetDefault(addr.id)} />
                        ))}
                      </div>
                    )
                  }
                </div>

                {addrMsg && (
                  <div style={{ backgroundColor: addrMsg.includes('success') ? 'rgba(34,139,34,0.08)' : 'rgba(139,26,42,0.08)', border: `1px solid ${addrMsg.includes('success') ? 'rgba(34,139,34,0.25)' : 'rgba(139,26,42,0.25)'}`, borderRadius: '4px', padding: '0.65rem 1rem', marginTop: '-0.75rem' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: addrMsg.includes('success') ? '#228B22' : 'var(--color-crimson)', margin: 0 }}>{addrMsg}</p>
                  </div>
                )}

                {showAddrForm && (
                  <div className="card-arabic" style={{ padding: '2rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>Add New Address</h3>
                    <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Label</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['Home', 'Work', 'Other'].map((l) => (
                            <button key={l} type="button" onClick={() => setAddrForm((f) => ({ ...f, label: l }))}
                              style={{ padding: '0.4rem 1rem', border: `1px solid ${addrForm.label === l ? 'var(--color-terra)' : 'var(--color-border)'}`, borderRadius: '999px', background: addrForm.label === l ? 'rgba(192,98,42,0.08)' : 'none', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: addrForm.label === l ? 'var(--color-terra)' : 'var(--color-espresso-lt)', cursor: 'pointer' }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Address Line 1 *</label>
                        <input required value={addrForm.line1} onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))} placeholder="House / Flat / Building and street" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      </div>
                      <div>
                        <label style={labelStyle}>Address Line 2</label>
                        <input value={addrForm.line2} onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))} placeholder="Area, Colony, Locality" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={labelStyle}>City *</label>
                          <input required value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} placeholder="Pondicherry" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                        </div>
                        <div>
                          <label style={labelStyle}>Pincode *</label>
                          <input required value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} placeholder="605001" style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Landmark</label>
                        <input value={addrForm.landmark} onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))} placeholder="Near temple, school, etc." style={inputStyle} onFocus={focusEl} onBlur={blurEl} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={savingAddr} className="btn-gold"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', fontSize: '0.7rem', letterSpacing: '0.1em', opacity: savingAddr ? 0.7 : 1, cursor: savingAddr ? 'wait' : 'pointer' }}>
                          <Check size={13} /> {savingAddr ? 'Saving…' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => setShowAddrForm(false)} style={cancelBtnStyle}>
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ═══ FAVOURITES TAB ═══ */}
            {tab === 'favourites' && (
              <div className="card-arabic" style={{ padding: '2rem' }}>
                <h2 style={panelHeading}>Favourite Dishes</h2>
                <p style={{ ...panelSub, marginBottom: '1.75rem' }}>Your pinned favourites from our menu</p>

                {favourites.length === 0
                  ? (
                    <div style={emptyBox}>
                      <Heart size={36} color="var(--color-border-strong)" style={{ margin: '0 auto 1rem' }} />
                      <p style={emptyText}>No favourites pinned yet</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', marginTop: '0.4rem', marginBottom: '1.25rem' }}>Browse the menu and tap ♡ on any dish to pin it here</p>
                      <Link href="/menu" className="btn-gold" style={{ fontSize: '0.7rem', padding: '0.6rem 1.5rem', display: 'inline-flex' }}>Browse Menu</Link>
                    </div>
                  )
                  : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                      {favourites.map((item) => (
                        <FavouriteCard key={item.id} item={item} onUnpin={() => handleUnpin(item.id)} />
                      ))}
                    </div>
                  )
                }
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false, size = 16 }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: number
}) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: '1px', lineHeight: 1 }}>
          <Star size={size}
            fill={(hover || value) >= star ? 'var(--color-gold)' : 'none'}
            color={(hover || value) >= star ? 'var(--color-gold)' : 'var(--color-border-strong)'} />
        </button>
      ))}
    </div>
  )
}

function OrderCard({ order, expanded, onToggle, onRateOrder, onRateItem }: {
  order: Order; expanded: boolean; onToggle: () => void
  onRateOrder: (r: number) => void; onRateItem: (itemId: string, r: number) => void
}) {
  const statusColors: Record<string, string> = {
    DELIVERED: '#228B22', COMPLETED: '#228B22',
    CANCELLED: 'var(--color-crimson)',
    PENDING: 'var(--color-gold)', CONFIRMED: 'var(--color-gold)',
    PREPARING: 'var(--color-terra)', READY: 'var(--color-terra)',
    OUT_FOR_DELIVERY: 'var(--color-terra)',
  }
  const sc = statusColors[order.status] || 'var(--color-espresso-lt)'

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: expanded ? 'var(--color-bg-tertiary)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
          <Package size={18} color="var(--color-terra)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--color-espresso)', marginBottom: '2px' }}>#{order.order_number}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ padding: '2px 10px', borderRadius: '999px', backgroundColor: `${sc}18`, fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 600, color: sc }}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--color-espresso)' }}>₹{Number(order.total).toFixed(0)}</p>
          {expanded ? <ChevronUp size={15} color="var(--color-espresso-lt)" /> : <ChevronDown size={15} color="var(--color-espresso-lt)" />}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
          {/* Items with per-item rating */}
          <p style={sectionLabel}>Items</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso)', marginBottom: '5px' }}>
                    {item.name} <span style={{ color: 'var(--color-espresso-lt)' }}>× {item.quantity}</span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-espresso-lt)' }}>Rate dish:</span>
                    <StarRating value={item.item_rating ?? 0} onChange={(r) => onRateItem(item.id, r)} size={13} />
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-espresso)', marginLeft: '1rem' }}>₹{Number(item.total_price).toFixed(0)}</p>
              </div>
            ))}
          </div>

          {/* Receipt */}
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '6px', padding: '1rem', marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Receipt</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <ReceiptRow label="Subtotal" value={`₹${Number(order.subtotal).toFixed(0)}`} />
              {Number(order.delivery_fee) > 0 && <ReceiptRow label="Delivery fee" value={`₹${Number(order.delivery_fee).toFixed(0)}`} />}
              {Number(order.discount) > 0 && <ReceiptRow label="Discount" value={`−₹${Number(order.discount).toFixed(0)}`} green />}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)', letterSpacing: '0.05em' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)', letterSpacing: '0.05em' }}>₹{Number(order.total).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Overall order rating */}
          {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={sectionLabel}>Rate overall order:</span>
              <StarRating value={order.rating ?? 0} onChange={onRateOrder} size={18} />
              {(order.rating ?? 0) > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-espresso-lt)' }}>Thank you!</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddressCard({ address, onDelete, onSetDefault }: {
  address: Address; onDelete: () => void; onSetDefault: () => void
}) {
  return (
    <div style={{ border: `1px solid ${address.is_default ? 'var(--color-terra)' : 'var(--color-border)'}`, borderRadius: '8px', padding: '1.1rem', position: 'relative', backgroundColor: address.is_default ? 'rgba(192,98,42,0.04)' : 'transparent' }}>
      {address.is_default && (
        <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', fontSize: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--color-terra)', backgroundColor: 'rgba(192,98,42,0.1)', padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Default</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <MapPin size={13} color="var(--color-terra)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>{address.label}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-espresso)', lineHeight: 1.65, marginBottom: '0.75rem' }}>
        {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
        {address.city} – {address.pincode}
        {address.landmark && <><br /><span style={{ color: 'var(--color-espresso-lt)', fontSize: '0.75rem' }}>Near {address.landmark}</span></>}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!address.is_default && (
          <button onClick={onSetDefault}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-terra)', background: 'none', border: '1px solid var(--color-terra)', borderRadius: '4px', padding: '3px 10px', cursor: 'pointer' }}>
            Set Default
          </button>
        )}
        <button onClick={onDelete}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-crimson)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-espresso-lt)' }}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  )
}

function FavouriteCard({ item, onUnpin }: { item: FavouriteItem; onUnpin: () => void }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ height: '90px', backgroundColor: 'var(--color-bg-tertiary)', overflow: 'hidden' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>🍽️</div>
        }
      </div>
      <div style={{ padding: '0.75rem' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: 'var(--color-espresso)', letterSpacing: '0.05em', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-espresso-lt)', marginBottom: '0.5rem' }}>{item.category}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--color-terra)' }}>₹{item.price}</span>
          <button onClick={onUnpin}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-espresso-lt)', padding: '2px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-crimson)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-espresso-lt)' }}>
            <Heart size={11} fill="var(--color-terra)" color="var(--color-terra)" /> Unpin
          </button>
        </div>
      </div>
    </div>
  )
}

function ReceiptRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  const color = green ? '#228B22' : 'var(--color-espresso-lt)'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color }}>{value}</span>
    </div>
  )
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

function FieldVal({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: muted ? 'var(--color-espresso-lt)' : 'var(--color-espresso)', padding: '0.55rem 0', borderBottom: '1px solid var(--color-border)' }}>
      {children}
    </p>
  )
}

function Unset() {
  return <span style={{ color: 'var(--color-espresso-lt)', fontStyle: 'italic' }}>Not set</span>
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.4rem' }

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-bg-primary)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-espresso)', outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', boxSizing: 'border-box' }

const panelHeading: React.CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-espresso)', letterSpacing: '0.06em', marginBottom: '0.3rem' }

const panelSub: React.CSSProperties = { fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-espresso-lt)' }

const hintStyle: React.CSSProperties = { fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-espresso-lt)', marginTop: '4px' }

const emptyBox: React.CSSProperties = { textAlign: 'center', padding: '3rem 2rem', border: '1px dashed var(--color-border)', borderRadius: '8px' }

const emptyText: React.CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-espresso-lt)', textAlign: 'center' }

const sectionLabel: React.CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', marginBottom: '0.75rem' }

const editBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)', transition: 'border-color 0.2s' }

const cancelBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-espresso-lt)' }

function focusEl(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--color-terra)'
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(192,98,42,0.1)'
}

function blurEl(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--color-border)'
  e.currentTarget.style.boxShadow   = 'none'
}
