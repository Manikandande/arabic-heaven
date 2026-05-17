import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) return NextResponse.json({ tables: [] })

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1)

  const tables = await prisma.diningTable.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      reservations: {
        where: {
          date: { gte: todayStart, lt: todayEnd },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        },
        orderBy: { timeSlot: 'asc' },
      },
    },
    orderBy: { tableNumber: 'asc' },
  })

  return NextResponse.json({
    tables: tables.map(t => ({
      id: t.id,
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      isActive: t.isActive,
      reservations: t.reservations.map(r => ({
        id: r.id,
        guestName: r.guestName,
        partySize: r.partySize,
        timeSlot: r.timeSlot,
        status: r.status,
      })),
    })),
  })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { tableNumber, capacity } = await req.json()
  if (!tableNumber || !capacity) return NextResponse.json({ error: 'tableNumber and capacity are required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) return NextResponse.json({ error: 'No restaurant configured' }, { status: 500 })

  const existing = await prisma.diningTable.findUnique({
    where: { restaurantId_tableNumber: { restaurantId: restaurant.id, tableNumber: String(tableNumber) } },
  })
  if (existing) return NextResponse.json({ error: `Table ${tableNumber} already exists` }, { status: 409 })

  const table = await prisma.diningTable.create({
    data: { restaurantId: restaurant.id, tableNumber: String(tableNumber), capacity: Number(capacity) },
  })
  return NextResponse.json({ table })
}
