import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const orders = await prisma.order.findMany({
      where: { profileId: user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = orders.map((order) => ({
      id: order.id,
      order_number: order.orderNumber,
      type: order.type,
      status: order.status,
      subtotal: Number(order.subtotal),
      delivery_fee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      rating: order.rating,
      created_at: order.createdAt,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.itemName,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
        total_price: Number(item.totalPrice),
        item_rating: item.itemRating,
      })),
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('Orders fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
