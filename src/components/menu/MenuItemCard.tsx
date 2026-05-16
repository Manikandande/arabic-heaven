'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { MenuItem } from '@/lib/menuData'
import { tagColors } from '@/lib/menuData'
import { useCart } from '@/context/CartContext'
import { imgSrc } from '@/lib/imagePath'

interface Props {
  item: MenuItem
  isFavourited?: boolean
  showFavourite?: boolean
  onToggleFavourite?: (item: MenuItem, adding: boolean) => void
}

export default function MenuItemCard({ item, isFavourited = false, showFavourite = false, onToggleFavourite }: Props) {
  const { addItem } = useCart()
  const [added, setAdded]           = useState(false)
  const [localFav, setLocalFav]     = useState(isFavourited)
  const [heartAnim, setHeartAnim]   = useState(false)

  // Keep in sync if parent updates (e.g. on login)
  if (localFav !== isFavourited && !heartAnim) setLocalFav(isFavourited)

  function handleAdd() {
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  function handleToggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    const adding = !localFav
    setLocalFav(adding)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 300)
    onToggleFavourite?.(item, adding)
  }

  return (
    <div
      className="card-arabic"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        opacity: item.available ? 1 : 0.55,
        position: 'relative',
      }}
    >
      {/* Sold out ribbon */}
      {!item.available && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'var(--color-crimson)',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.58rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.55rem',
            zIndex: 2,
          }}
        >
          Sold Out
        </div>
      )}

      {/* Favourite heart — only shown when user is logged in */}
      {showFavourite && (
        <button
          onClick={handleToggleFav}
          title={localFav ? 'Remove from favourites' : 'Add to favourites'}
          style={{
            position: 'absolute',
            top: '0.7rem',
            left: '0.7rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(253,246,238,0.92)',
            border: `1px solid ${localFav ? 'rgba(139,26,42,0.3)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform 0.15s ease, border-color 0.2s',
            transform: heartAnim ? 'scale(1.3)' : 'scale(1)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Heart
            size={14}
            fill={localFav ? 'var(--color-crimson)' : 'none'}
            color={localFav ? 'var(--color-crimson)' : 'var(--color-espresso-lt)'}
          />
        </button>
      )}

      {/* Food image */}
      <div
        style={{
          width: '100%',
          height: item.image ? '200px' : '130px',
          backgroundColor: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem',
          marginBottom: '0.25rem',
          borderBottom: '1px solid var(--color-border)',
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {item.image ? (
          <img
            src={imgSrc(item.image)}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          item.emoji
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {item.tags.map((tag) => {
          const s = tagColors[tag] ?? { bg: 'rgba(200,150,12,0.12)', color: 'var(--color-gold)' }
          return (
            <span
              key={tag}
              style={{
                fontSize: '0.58rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.18rem 0.5rem',
                backgroundColor: s.bg,
                color: s.color,
              }}
            >
              {tag}
            </span>
          )
        })}
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          color: 'var(--color-espresso)',
          letterSpacing: '0.04em',
          lineHeight: 1.3,
        }}
      >
        {item.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          color: 'var(--color-espresso-lt)',
          lineHeight: 1.65,
          flex: 1,
        }}
      >
        {item.description}
      </p>

      {/* Serving / spice */}
      {(item.servingSize || item.spiceLevel) && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          {item.servingSize && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-espresso-lt)', fontFamily: 'var(--font-body)' }}>
              👥 {item.servingSize}
            </span>
          )}
          {item.spiceLevel && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-saffron-light)', fontFamily: 'var(--font-body)' }}>
              {'🌶'.repeat(item.spiceLevel)}
            </span>
          )}
        </div>
      )}

      {/* Price + Add */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--color-gold)' }}>
          ₹{item.price}
        </span>

        <button
          onClick={handleAdd}
          disabled={!item.available}
          className={item.available ? 'btn-gold' : ''}
          style={{
            fontSize: '0.62rem',
            padding: '0.42rem 0.9rem',
            cursor: item.available ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s ease',
            ...(added ? { backgroundColor: 'var(--color-gold)', color: '#ffffff', border: '1px solid var(--color-gold)' } : {}),
          }}
        >
          {added ? '✓ Added' : '+ Add'}
        </button>
      </div>
    </div>
  )
}
