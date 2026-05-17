import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { type: 'DELIVERY' }
  if (status && status !== 'all') where.status = status

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, address: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      guestName: o.guestName,
      guestPhone: o.guestPhone,
      guestEmail: o.guestEmail,
      total: Number(o.total),
      deliveryFee: Number(o.deliveryFee),
      notes: o.notes,
      address: o.address
        ? [o.address.line1, o.address.line2, o.address.landmark, `${o.address.city} - ${o.address.pincode}`].filter(Boolean).join(', ')
        : null,
      items: o.items.map(i => ({ name: i.itemName, qty: i.quantity })),
      createdAt: o.createdAt,
    })),
  })
}
