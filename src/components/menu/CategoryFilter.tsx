'use client'

import type { MenuCategory } from '@/lib/menuData'

interface Props {
  categories: MenuCategory[]
  active: string
  onChange: (id: string) => void
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div
      style={{
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-btn { transition: all 0.25s ease; white-space: nowrap; border: none; cursor: pointer; }
        .cat-btn:hover { color: var(--color-gold); }
      `}</style>

      <div
        className="cat-scroll"
        style={{
          display: 'flex',
          gap: '0.5rem',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === active
          return (
            <button
              key={cat.id}
              className="cat-btn"
              onClick={() => onChange(cat.id)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.55rem 1.1rem',
                backgroundColor: isActive ? 'var(--color-gold)' : 'var(--color-bg-card)',
                color: isActive ? 'var(--color-bg-primary)' : 'var(--color-cream-muted)',
                border: `1px solid ${isActive ? 'var(--color-gold)' : 'var(--color-border)'}`,
              }}
            >
              {cat.emoji}&nbsp;&nbsp;{cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
