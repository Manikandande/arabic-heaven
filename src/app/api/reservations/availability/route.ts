import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RESTAURANT_SLUG = 'arabic-heaven-mandi'

// GET /api/reservations/availability?date=2024-01-15
// Returns { [slot]: { count: number; full: boolean } } for all slots on that date
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  try {
    const restaurant = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
    const capacity = restaurant?.tableCapacity ?? 5

    const from = new Date(`${date}T00:00:00.000Z`)
    const to   = new Date(`${date}T23:59:59.999Z`)

    const reservations = await prisma.reservation.groupBy({
      by: ['timeSlot'],
      where: {
        restaurantId: restaurant?.id ?? '',
        date: { gte: from, lte: to },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      _count: { id: true },
    })

    const result: Record<string, { count: number; full: boolean }> = {}
    for (const row of reservations) {
      const count = row._count.id
      result[row.timeSlot] = { count, full: count >= capacity }
    }

    return NextResponse.json({ capacity, slots: result })
  } catch (err) {
    console.error('Availability fetch error:', err)
    return NextResponse.json({ capacity: 5, slots: {} })
  }
}
