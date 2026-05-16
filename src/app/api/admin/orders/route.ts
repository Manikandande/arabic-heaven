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
    where.createdAt = { gte: d, lt: next }
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(orders.map(o => ({
    id: o.id, orderNumber: o.orderNumber, status: o.status, type: o.type,
    paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    subtotal: Number(o.subtotal), deliveryFee: Number(o.deliveryFee),
    total: Number(o.total), notes: o.notes, createdAt: o.createdAt,
    guestName: o.guestName, guestPhone: o.guestPhone,
    items: o.items.map(i => ({ name: i.itemName, quantity: i.quantity, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice) })),
  })))
}
