'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
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
import { imgSrc } from '@/lib/imagePath'

interface PopularItem {
  itemId: string
  name: string
  category: string
  price: number
  imageUrl: string | null
  count: number
}

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

  // ── Most Loved ────────────────────────────────────────────────────────────
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])

  useEffect(() => {
    fetch('/api/favourites/popular')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PopularItem[]) => {
        if (data.length > 0) {
          setPopularItems(data)
        } else {
          // Fallback: Bestseller-tagged items from static menu data
          const fallback = menuItems
            .filter((i) => i.tags.includes('Bestseller') && i.available)
            .slice(0, 8)
            .map((i) => ({ itemId: i.id, name: i.name, category: i.category, price: i.price, imageUrl: i.image ?? null, count: 0 }))
          setPopularItems(fallback)
        }
      })
      .catch(() => {
        const fallback = menuItems
          .filter((i) => i.tags.includes('Bestseller') && i.available)
          .slice(0, 8)
          .map((i) => ({ itemId: i.id, name: i.name, category: i.category, price: i.price, imageUrl: i.image ?? null, count: 0 }))
        setPopularItems(fallback)
      })
  }, [])

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

  const showMostLoved = popularItems.length > 0

  const popularItemIds = useMemo(() => new Set(popularItems.map((p) => p.itemId)), [popularItems])

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

        {/* ── Most Loved strip ── */}
        {showMostLoved && (
          <section style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
                <Heart size={15} fill="var(--color-crimson)" color="var(--color-crimson)" />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-espresso)' }}>
                  Most Loved by Our Guests
                </h2>
                {popularItems[0]?.count > 0 && (
                  <span style={{ fontFamily: 'var(--font-elegant)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--color-espresso-lt)', marginLeft: '0.25rem' }}>
                    — based on {popularItems.reduce((s, i) => s + i.count, 0)} favourites
                  </span>
                )}
              </div>

              {/* Horizontal scroll strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                }}
              >
                {popularItems.map((pop) => {
                  const menuItem = menuItems.find((m) => m.id === pop.itemId)
                  return (
                    <MostLovedChip
                      key={pop.itemId}
                      item={pop}
                      menuItem={menuItem}
                      isFavourited={favouriteIds.has(pop.itemId)}
                      showFavourite={!!user}
                      onToggle={() => {
                        if (!menuItem) return
                        const adding = !favouriteIds.has(pop.itemId)
                        handleToggleFavourite(menuItem, adding)
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </section>
        )}

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
                style={{ fontSize: '0.68rem', padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', position: 'relative' }}
              >
                🛒 Cart
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
                    isMostLoved={popularItemIds.has(item.id)}
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

// ── Most Loved chip component ─────────────────────────────────────────────────

function MostLovedChip({ item, menuItem, isFavourited, showFavourite, onToggle }: {
  item: PopularItem
  menuItem?: MenuItem
  isFavourited: boolean
  showFavourite: boolean
  onToggle: () => void
}) {
  const { addItem } = useCart()
  const [localFav, setLocalFav] = useState(isFavourited)
  const [added, setAdded]       = useState(false)

  if (localFav !== isFavourited) setLocalFav(isFavourited)

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    setLocalFav((v) => !v)
    onToggle()
  }

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    if (!menuItem?.available) return
    addItem(menuItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const unavailable = menuItem && !menuItem.available

  return (
    <div
      style={{
        flexShrink: 0,
        width: '150px',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        position: 'relative',
        opacity: unavailable ? 0.6 : 1,
      }}
    >
      {/* Image */}
      <div style={{ height: '80px', backgroundColor: 'var(--color-bg-tertiary)', overflow: 'hidden', position: 'relative' }}>
        {item.imageUrl ? (
          <img src={imgSrc(item.imageUrl)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🍽️</div>
        )}

        {/* Favourite count badge */}
        {item.count > 0 && (
          <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(139,26,42,0.85)', color: '#fff', fontSize: '0.6rem', fontFamily: 'var(--font-body)', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Heart size={8} fill="#fff" color="#fff" /> {item.count}
          </span>
        )}

        {/* Heart toggle */}
        {showFavourite && (
          <button
            onClick={handleToggle}
            style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(253,246,238,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Heart size={11} fill={localFav ? 'var(--color-crimson)' : 'none'} color={localFav ? 'var(--color-crimson)' : 'var(--color-espresso-lt)'} />
          </button>
        )}
      </div>

      {/* Info + Add button */}
      <div style={{ padding: '0.5rem 0.6rem 0.6rem' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', color: 'var(--color-espresso)', letterSpacing: '0.04em', lineHeight: 1.3, marginBottom: '2px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {item.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: 'var(--color-terra)' }}>₹{item.price}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={!!unavailable}
          style={{
            width: '100%',
            padding: '0.3rem 0',
            backgroundColor: added ? 'var(--color-gold)' : 'var(--color-terra)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: unavailable ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.58rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'background-color 0.2s',
          }}
        >
          {added ? '✓ Added' : unavailable ? 'Sold Out' : '+ Add'}
        </button>
      </div>
    </div>
  )
}
