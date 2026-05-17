import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

function generateOrderNumber() {
  const d    = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `AH-${d}-${rand}`
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { type, guestName, guestPhone, items, discount, paymentMethod, paymentStatus, tableId, notes } = await req.json()

  if (!type || !items?.length) return NextResponse.json({ error: 'type and items are required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) return NextResponse.json({ error: 'No restaurant configured' }, { status: 500 })

  const subtotal    = items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
  const discountAmt = Number(discount ?? 0)
  const total       = Math.max(0, subtotal - discountAmt)

  const order = await prisma.order.create({
    data: {
      restaurantId:  restaurant.id,
      orderNumber:   generateOrderNumber(),
      type,
      status:        'CONFIRMED',
      paymentStatus: paymentStatus ?? 'UNPAID',
      paymentMethod: paymentMethod ?? null,
      subtotal,
      deliveryFee:   0,
      discount:      discountAmt,
      total,
      guestName:     guestName || null,
      guestPhone:    guestPhone || null,
      notes:         notes || null,
      items: {
        create: items.map((i: any) => ({
          itemName:   i.name,
          quantity:   i.qty,
          unitPrice:  i.price,
          totalPrice: i.price * i.qty,
          notes:      i.notes || null,
        })),
      },
    },
    include: { items: true },
  })

  // Assign table if dine-in and tableId provided
  if (type === 'DINE_IN' && tableId) {
    const today    = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        tableId,
        guestName:   guestName || 'Walk-in',
        guestPhone:  guestPhone || '',
        partySize:   1,
        date:        today,
        timeSlot:    new Date().toTimeString().slice(0, 5),
        status:      'SEATED',
        depositPaid: true,
      },
    }).catch(() => null) // non-critical
  }

  return NextResponse.json({
    order: {
      id: order.id, orderNumber: order.orderNumber, status: order.status,
      type: order.type, total: Number(order.total), createdAt: order.createdAt,
    },
  })
}

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
