'use client'

const platforms = [
  {
    name: 'Swiggy',
    emoji: '🟠',
    description: 'Order on Swiggy',
    href: 'https://swiggy.com',
    color: '#FC8019',
  },
  {
    name: 'Zomato',
    emoji: '🔴',
    description: 'Order on Zomato',
    href: 'https://zomato.com',
    color: '#E23744',
  },
  {
    name: 'ONDC',
    emoji: '🟢',
    description: 'Order via ONDC Network',
    href: '#',
    color: '#2e7d32',
  },
]

export default function PlatformLinks() {
  return (
    <section
      style={{ backgroundColor: 'var(--color-bg-primary)', padding: '2.5rem 1.5rem', textAlign: 'center' }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-espresso-lt)',
            marginBottom: '1.25rem',
          }}
        >
          Also Available On
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.6rem 1.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-card)',
                textDecoration: 'none',
                transition: 'all 0.22s ease',
                color: 'var(--color-espresso-md)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = p.color
                e.currentTarget.style.color = p.color
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-espresso-md)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{p.emoji}</span>
              {p.description}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
