type Level = 'info' | 'warn' | 'error'

interface LogOptions {
  event: string
  level?: Level
  payload?: Record<string, unknown>
  error?: string
}

export function logEvent({ event, level = 'info', payload, error }: LogOptions) {
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, level, payload, error }),
  }).catch(() => {}) // fire-and-forget — never block the UI
}
