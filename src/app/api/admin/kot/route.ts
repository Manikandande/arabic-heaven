import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const orders = await prisma.order.findMany({
    where: {
      type: { in: ['DINE_IN', 'TAKEAWAY'] },
      status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
    },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      type: o.type,
      status: o.status,
      guestName: o.guestName,
      guestPhone: o.guestPhone,
      notes: o.notes,
      items: o.items.map(i => ({ name: i.itemName, qty: i.quantity, notes: i.notes })),
      createdAt: o.createdAt,
    })),
  })
}
