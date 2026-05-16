import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const date   = searchParams.get('date')

  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status
  if (date) {
    const d = new Date(`${date}T00:00:00.000Z`)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.date = { gte: d, lt: next }
  }

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
    take: 100,
  })

  return NextResponse.json(reservations.map(r => ({
    id: r.id, guestName: r.guestName, guestPhone: r.guestPhone, guestEmail: r.guestEmail,
    partySize: r.partySize, date: r.date, timeSlot: r.timeSlot, status: r.status,
    notes: r.notes, depositAmount: Number(r.depositAmount ?? 50),
    depositPaid: r.depositPaid, utrNumber: r.utrNumber, createdAt: r.createdAt,
  })))
}
