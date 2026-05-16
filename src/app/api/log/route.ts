import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, level = 'info', payload, error } = body

    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'event is required' }, { status: 400 })
    }

    // Try to get the current user (optional — guests are fine)
    let userId: string | undefined
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    } catch {}

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      undefined

    const userAgent = req.headers.get('user-agent') ?? undefined

    const log = await prisma.eventLog.create({
      data: {
        event,
        level,
        userId: userId ?? null,
        payload: payload ?? null,
        error: error ?? null,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      },
    })

    // Mirror to server console so it appears in Vercel function logs
    const msg = `[${level.toUpperCase()}] ${event}${error ? ` | ${error}` : ''}`
    level === 'error' ? console.error(msg, payload) : console.log(msg, payload)

    return NextResponse.json({ ok: true, id: log.id })
  } catch (err) {
    console.error('EventLog write failed:', err)
    return NextResponse.json({ error: 'Failed to write log' }, { status: 500 })
  }
}
