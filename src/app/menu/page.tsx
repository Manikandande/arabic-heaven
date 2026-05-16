'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ShoppingCart } from 'lucide-react'
import { menuItems, categories } from '@/lib/menuData'
import type { MenuItem } from '@/lib/menuData'
import MenuItemCard from '@/components/menu/MenuItemCard'
import CategoryFilter from '@/components/menu/CategoryFilter'
import MenuSearchBar from '@/components/menu/MenuSearchBar'
import CartDrawer from '@/components/menu/CartDrawer'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { totalItems, openCart } = useCart()
  const { user } = useAuth()

  // ── Favourites ────────────────────────────────────────────────────────────
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      const favs: { id: string }[] = user.user_metadata?.favourites ?? []
      setFavouriteIds(new Set(favs.map((f) => f.id)))
    } else {
      setFavouriteIds(new Set())
    }
  }, [user])

  const handleToggleFavourite = useCallback(async (item: MenuItem, adding: boolean) => {
    if (!user) return

    // Update local state immediately
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      adding ? next.add(item.id) : next.delete(item.id)
      return next
    })

    // Update user_metadata
    const supabase = createClient()
    const current: { id: string; name: string; category: string; price: number; image_url?: string }[] =
      user.user_metadata?.favourites ?? []

    const updated = adding
      ? [...current.filter((f) => f.id !== item.id), { id: item.id, name: item.name, category: item.category, price: item.price, image_url: item.image }]
      : current.filter((f) => f.id !== item.id)

    await supabase.auth.updateUser({ data: { favourites: updated } })

    // Write to DB (fire-and-forget — works once DB is set up)
    fetch('/api/favourites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, name: item.name, category: item.category, price: item.price, imageUrl: item.image ?? null, adding }),
    }).catch(() => {})
  }, [user])

  // ── Community ratings → Most Loved badge ─────────────────────────────────
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number; count: number }>>({})

  useEffect(() => {
    fetch('/api/menu/ratings')
      .then((res) => (res.ok ? res.json() : {}))
      .then(setRatingsMap)
      .catch(() => {})
  }, [])

  // ── User order history → "×N ordered" badge ──────────────────────────────
  const [orderedMap, setOrderedMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) { setOrderedMap({}); return }
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : []))
      .then((orders: { items: { name: string; quantity: number }[] }[]) => {
        const map: Record<string, number> = {}
        for (const order of orders) {
          for (const item of order.items) {
            const key = item.name.toLowerCase()
            map[key] = (map[key] ?? 0) + item.quantity
          }
        }
        setOrderedMap(map)
      })
      .catch(() => {})
  }, [user])

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = menuItems
    if (activeCategory !== 'all') list = list.filter((item) => item.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
    }
    return list
  }, [activeCategory, search])

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>

        {/* ── Page hero ── */}
        <section
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            paddingTop: '8rem',
            paddingBottom: '3rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="pattern-arabesque" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1rem' }}>
              ✦ &nbsp; Arabic Heaven Mandi &nbsp; ✦
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--color-espresso)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Our Menu
            </h1>
            <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--color-espresso-lt)', maxWidth: '480px', margin: '0 auto' }}>
              Authentic Arabian cuisine, prepared fresh every day in our traditional kitchen.
            </p>
          </div>
        </section>

        {/* ── Sticky filter bar ── */}
        <div
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 100,
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem 1.5rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={(id) => { setActiveCategory(id); setSearch('') }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MenuSearchBar value={search} onChange={setSearch} />
              <button
                onClick={openCart}
                className="btn-gold"
                style={{ fontSize: '0.68rem', padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', position: 'relative' }}
              >
                <ShoppingCart size={14} strokeWidth={2} /> Cart
                {totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-crimson)', color: '#fff', fontSize: '0.58rem', fontFamily: 'var(--font-heading)', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Sign-in nudge (shown only to guests) ── */}
        {!user && (
          <div style={{ backgroundColor: 'rgba(192,98,42,0.06)', borderBottom: '1px solid rgba(192,98,42,0.15)', padding: '0.6rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-espresso-lt)' }}>
              <a href="/signin" style={{ color: 'var(--color-terra)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
              {' '}to save your favourite dishes and get personalised recommendations
            </p>
          </div>
        )}

        {/* ── Menu grid ── */}
        <section className="section-padding">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-espresso-lt)', marginBottom: '1.5rem' }}>
              {filtered.length} dish{filtered.length !== 1 ? 'es' : ''}
              {search ? ` matching "${search}"` : activeCategory !== 'all' ? ` in ${categories.find((c) => c.id === activeCategory)?.label}` : ''}
              {user && favouriteIds.size > 0 && ` · ${favouriteIds.size} favourited`}
            </p>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-espresso-lt)' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
                <p style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                  No dishes found for &ldquo;{search}&rdquo;
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('all') }}
                  style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
                {filtered.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    isFavourited={favouriteIds.has(item.id)}
                    showFavourite={!!user}
                    onToggleFavourite={handleToggleFavourite}
                    communityRating={ratingsMap[item.name.toLowerCase()]}
                    orderedCount={user ? orderedMap[item.name.toLowerCase()] : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
