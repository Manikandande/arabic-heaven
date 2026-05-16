'use client'

export default function WhatsAppButton() {
  const phone = '917942696368'
  const message = encodeURIComponent('Hello! I would like to know more about Arabic Heaven Mandi.')
  const href = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 300,
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.55)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)'
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.664 4.784 1.82 6.776L2 30l7.42-1.792A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.4a11.36 11.36 0 01-5.8-1.592l-.416-.246-4.4 1.062 1.1-4.268-.272-.44A11.4 11.4 0 014.6 16C4.6 9.704 9.704 4.6 16 4.6S27.4 9.704 27.4 16 22.296 27.4 16 27.4zm6.18-8.56c-.34-.17-2.01-.99-2.322-1.1-.31-.11-.536-.17-.76.17-.226.34-.874 1.1-1.07 1.326-.198.226-.394.254-.734.085-.34-.17-1.433-.527-2.73-1.683-1.01-.9-1.692-2.01-1.89-2.35-.197-.34-.02-.523.148-.692.152-.152.34-.394.51-.592.17-.198.226-.34.34-.566.112-.226.056-.424-.028-.594-.085-.17-.76-1.832-1.04-2.508-.274-.66-.55-.57-.76-.58l-.648-.01c-.226 0-.594.085-.904.424-.31.34-1.18 1.154-1.18 2.814s1.208 3.264 1.378 3.49c.17.226 2.378 3.632 5.762 5.09.806.348 1.434.556 1.924.712.808.258 1.544.222 2.126.134.648-.096 1.994-.814 2.276-1.6.282-.786.282-1.46.198-1.6-.084-.14-.31-.226-.65-.396z" />
      </svg>
    </a>
  )
}
