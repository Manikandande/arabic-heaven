import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    pendingOrders,
    todayOrders,
    todayRevenue,
    pendingReservations,
    todayReservations,
    pendingUtr,
    recentOrders,
    recentReservations,
  ] = await Promise.all([
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } }, _sum: { total: true } }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.reservation.count({ where: { depositPaid: false, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.reservation.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
  ])

  return NextResponse.json({
    stats: {
      pendingOrders,
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      pendingReservations,
      todayReservations,
      pendingUtr,
    },
    recentOrders: recentOrders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status, type: o.type,
      total: Number(o.total), createdAt: o.createdAt,
      guestName: o.guestName, itemCount: o.items.length,
    })),
    recentReservations: recentReservations.map(r => ({
      id: r.id, guestName: r.guestName, guestPhone: r.guestPhone,
      date: r.date, timeSlot: r.timeSlot, partySize: r.partySize,
      status: r.status, depositPaid: r.depositPaid,
    })),
  })
}
