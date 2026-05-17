import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const date          = searchParams.get('date')
  const paymentStatus = searchParams.get('paymentStatus')

  const where: Record<string, unknown> = {}
  if (date) {
    const d    = new Date(`${date}T00:00:00.000Z`)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.createdAt = { gte: d, lt: next }
  }
  if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus

  const [bills, agg] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.order.aggregate({
      where: { ...where, status: { notIn: ['CANCELLED'] } },
      _sum: { total: true },
      _count: { id: true },
    }),
  ])

  const paid   = bills.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + Number(o.total), 0)
  const unpaid = bills.filter(o => o.paymentStatus === 'UNPAID' && o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total), 0)

  return NextResponse.json({
    summary: {
      totalRevenue: Number(agg._sum.total ?? 0),
      totalBills: agg._count.id,
      paid,
      unpaid,
    },
    bills: bills.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      type: o.type,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      guestName: o.guestName,
      guestPhone: o.guestPhone,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discount: Number(o.discount),
      total: Number(o.total),
      items: o.items.map(i => ({ name: i.itemName, qty: i.quantity, price: Number(i.unitPrice) })),
      createdAt: o.createdAt,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { orderId, paymentStatus, paymentMethod } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus, ...(paymentMethod ? { paymentMethod } : {}) },
  })
  return NextResponse.json({ ok: true, paymentStatus: updated.paymentStatus })
}
