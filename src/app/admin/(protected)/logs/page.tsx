'use client'

import { useEffect, useState } from 'react'

const LEVEL_COLOR: Record<string, string> = { info: '#2563eb', warn: '#d97706', error: '#dc2626' }
const EVENTS = ['all', 'signup', 'order_create', 'reservation_create', 'favourite_toggle']

export default function AdminLogs() {
  const [logs, setLogs]           = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [level, setLevel]         = useState('all')
  const [event, setEvent]         = useState('all')

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams({ level, event })
    fetch(`/api/admin/logs?${p}`)
      .then(r => r.json()).then(setLogs).finally(() => setLoading(false))
  }, [level, event])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Event Logs</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'info', 'warn', 'error'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              style={{ padding: '0.4rem 0.85rem', border: `1px solid ${level === l ? (LEVEL_COLOR[l] ?? 'var(--color-gold)') : '#e5ddd5'}`, backgroundColor: level === l ? `${LEVEL_COLOR[l] ?? 'var(--color-gold)'}18` : '#fff', color: level === l ? (LEVEL_COLOR[l] ?? 'var(--color-gold)') : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {EVENTS.map(e => (
            <button key={e} onClick={() => setEvent(e)}
              style={{ padding: '0.4rem 0.85rem', border: `1px solid ${event === e ? 'var(--color-gold)' : '#e5ddd5'}`, backgroundColor: event === e ? 'rgba(200,150,12,0.1)' : '#fff', color: event === e ? 'var(--color-gold)' : '#888', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
              {e === 'all' ? 'All events' : e}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</p> : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5ddd5', overflowX: 'auto' }}>
          {logs.length === 0
            ? <p style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888' }}>No logs found.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
                    {['Time', 'Level', 'Event', 'User', 'Error / Payload'].map(h => (
                      <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', fontWeight: 'normal' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f0ebe5' }}>
                      <td style={{ padding: '0.65rem 1rem', color: '#888', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', padding: '0.18rem 0.5rem', backgroundColor: `${LEVEL_COLOR[log.level] ?? '#888'}18`, color: LEVEL_COLOR[log.level] ?? '#888', textTransform: 'uppercase' }}>
                          {log.level}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--color-espresso)', fontFamily: 'var(--font-heading)', fontSize: '0.72rem' }}>{log.event}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#888', fontSize: '0.7rem' }}>{log.userId ? log.userId.slice(0, 8) + '…' : '—'}</td>
                      <td style={{ padding: '0.65rem 1rem', maxWidth: '320px' }}>
                        {log.error && <p style={{ color: '#dc2626', fontSize: '0.72rem', marginBottom: '2px' }}>{log.error}</p>}
                        {log.payload && <p style={{ color: '#888', fontSize: '0.68rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{JSON.stringify(log.payload)}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  )
}
