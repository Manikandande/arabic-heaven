'use client'

import { useEffect, useState, useCallback } from 'react'

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', SEATED: '#0891b2',
  COMPLETED: '#64748b', CANCELLED: '#dc2626', NO_SHOW: '#9ca3af',
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function padDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function AdminCalendar() {
  const now  = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(
    padDate(now.getFullYear(), now.getMonth(), now.getDate())
  )

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/reservations')
      .then(r => r.json())
      .then(d => setReservations(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Group by date string YYYY-MM-DD
  const byDate: Record<string, any[]> = {}
  reservations.forEach(r => {
    const d = typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0]
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(r)
  })

  // Calendar grid for current month
  const firstOfMonth = new Date(year, month, 1)
  const startDay     = firstOfMonth.getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr   = padDate(now.getFullYear(), now.getMonth(), now.getDate())
  const selectedResv = selectedDate ? (byDate[selectedDate] ?? []) : []

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-espresso)', letterSpacing: '0.04em' }}>Calendar</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Reservations and table bookings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={prevMonth} style={{ padding: '0.45rem 0.9rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)' }}>‹</button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)', letterSpacing: '0.06em', minWidth: '150px', textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ padding: '0.45rem 0.9rem', border: '1px solid #e5ddd5', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--color-espresso)' }}>›</button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDate(todayStr) }}
            style={{ padding: '0.45rem 0.85rem', border: '1px solid var(--color-gold)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', letterSpacing: '0.1em', cursor: 'pointer', marginLeft: '0.25rem' }}>
            Today
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Calendar grid */}
        <div style={{ flex: 1, minWidth: 0, backgroundColor: '#fff', border: '1px solid #e5ddd5' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '0.55rem', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>{d}</div>
            ))}
          </div>

          {loading
            ? <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-body)', color: '#888' }}>Loading…</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {cells.map((day, i) => {
                  const dateStr   = day ? padDate(year, month, day) : null
                  const resv      = dateStr ? (byDate[dateStr] ?? []) : []
                  const isToday   = dateStr === todayStr
                  const isSelected = dateStr === selectedDate
                  return (
                    <div key={i} onClick={() => day && setSelectedDate(dateStr)}
                      style={{
                        minHeight: '82px', padding: '0.45rem 0.5rem',
                        borderBottom: '1px solid #f0ebe5',
                        borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f0ebe5',
                        backgroundColor: isSelected ? 'rgba(200,150,12,0.1)' : isToday ? 'rgba(200,150,12,0.04)' : '#fff',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      {day && (
                        <>
                          <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: isToday ? 'var(--color-gold)' : 'transparent', marginBottom: '0.3rem' }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: isToday ? '#fff' : isSelected ? 'var(--color-gold)' : 'var(--color-espresso)', fontWeight: isToday ? 700 : 400 }}>{day}</span>
                          </div>
                          {resv.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {resv.slice(0, 2).map((r: any) => (
                                <div key={r.id} style={{ fontSize: '0.58rem', fontFamily: 'var(--font-body)', backgroundColor: `${STATUS_COLOR[r.status] ?? '#888'}18`, color: STATUS_COLOR[r.status] ?? '#888', padding: '1px 4px', borderRadius: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {fmtTime(r.timeSlot)} {r.guestName}
                                </div>
                              ))}
                              {resv.length > 2 && (
                                <p style={{ fontSize: '0.56rem', color: '#aaa', fontFamily: 'var(--font-body)' }}>+{resv.length - 2} more</p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* Day panel */}
        <div style={{ width: '260px', flexShrink: 0, backgroundColor: '#fff', border: '1px solid #e5ddd5', maxHeight: '520px', overflowY: 'auto' }}>
          <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid #e5ddd5', backgroundColor: '#faf6f0', position: 'sticky', top: 0 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Select a date'}
            </p>
            {selectedDate && selectedResv.length > 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-gold)', marginTop: '3px' }}>{selectedResv.length} reservation{selectedResv.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {!selectedDate
            ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#aaa', textAlign: 'center' }}>Click a date to view reservations</p>
            : selectedResv.length === 0
              ? <p style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>No reservations on this day</p>
              : selectedResv
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((r: any) => (
                    <div key={r.id} style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid #f0ebe5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: 'var(--color-espresso)' }}>{r.guestName}</p>
                        <span style={{ fontSize: '0.56rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', padding: '0.15rem 0.4rem', backgroundColor: `${STATUS_COLOR[r.status]}18`, color: STATUS_COLOR[r.status], textTransform: 'uppercase', flexShrink: 0, marginLeft: '0.4rem' }}>
                          {r.status}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#666' }}>🕐 {fmtTime(r.timeSlot)}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#666' }}>👥 {r.partySize} guests</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888' }}>📞 {r.guestPhone}</p>
                      {!r.depositPaid && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-crimson)', marginTop: '3px' }}>⚠ Deposit pending</p>
                      )}
                      {r.notes && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#aaa', marginTop: '3px', fontStyle: 'italic' }}>{r.notes}</p>
                      )}
                    </div>
                  ))
          }
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: `${color}40`, border: `1px solid ${color}` }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
