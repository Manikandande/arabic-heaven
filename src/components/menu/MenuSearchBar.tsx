'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function MenuSearchBar({ value, onChange }: Props) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
      <span
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-gold)',
          fontSize: '1rem',
          pointerEvents: 'none',
        }}
      >
        ✦
      </span>
      <input
        type="search"
        placeholder="Search dishes…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          padding: '0.65rem 1rem 0.65rem 2.5rem',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
    </div>
  )
}
