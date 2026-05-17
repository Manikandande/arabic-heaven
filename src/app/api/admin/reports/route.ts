import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const range = searchParams.get('range') ?? 'today'

  const now = new Date()
  let from: Date

  if (range === 'today') {
    from = new Date(now); from.setHours(0, 0, 0, 0)
  } else if (range === 'week') {
    from = new Date(now); from.setDate(now.getDate() - 6); from.setHours(0, 0, 0, 0)
  } else if (range === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    from = new Date(now); from.setHours(0, 0, 0, 0)
  }

  const [orders, topItems, byType, byPayment] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: from }, status: { notIn: ['CANCELLED'] } },
      _sum: { total: true, subtotal: true },
      _count: { id: true },
      _avg: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ['itemName'],
      where: { order: { createdAt: { gte: from }, status: { notIn: ['CANCELLED'] } } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['type'],
      where: { createdAt: { gte: from }, status: { notIn: ['CANCELLED'] } },
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { createdAt: { gte: from } },
      _count: { id: true },
    }),
  ])

  return NextResponse.json({
    range,
    from: from.toISOString(),
    revenue: {
      total: Number(orders._sum.total ?? 0),
      subtotal: Number(orders._sum.subtotal ?? 0),
      orderCount: orders._count.id,
      avgOrderValue: Number(orders._avg.total ?? 0).toFixed(2),
    },
    topItems: topItems.map(i => ({
      name: i.itemName,
      qty: i._sum.quantity ?? 0,
      revenue: Number(i._sum.totalPrice ?? 0),
    })),
    byType: byType.map(t => ({
      type: t.type,
      count: t._count.id,
      revenue: Number(t._sum.total ?? 0),
    })),
    byPayment: byPayment.map(p => ({
      status: p.paymentStatus,
      count: p._count.id,
    })),
  })
}
