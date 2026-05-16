import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 500
const RESTAURANT_SLUG = 'arabic-heaven-mandi'

function generateOrderNumber() {
  const date = new Date()
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `AH-${d}-${rand}`
}

async function getOrCreateRestaurant() {
  let restaurant = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        slug: RESTAURANT_SLUG,
        name: 'Arabic Heaven Mandi',
        address: 'Pondicherry',
        city: 'Pondicherry',
        phone: '+917942696368',
        email: 'info@arabicheaven.com',
      },
    })
  }
  return restaurant
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,           // 'DELIVERY' | 'TAKEAWAY'
      name,
      phone,
      email,
      // Address (for delivery)
      addressId,      // saved address ID (logged-in users)
      addressLine1,
      addressLine2,
      city,
      pincode,
      landmark,
      // Cart
      items,          // [{ id, name, price, quantity }]
      notes,
      paymentMethod,  // 'CASH' | 'ONLINE'
    } = body

    // Validate required fields
    if (!name || !phone || !type || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (type === 'DELIVERY' && !addressId && !addressLine1) {
      return NextResponse.json({ error: 'Delivery address required' }, { status: 400 })
    }

    // Check if user is logged in (optional — guests allowed)
    const supabase = await serverClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Calculate totals
    const subtotal: number = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)
    const deliveryFee = type === 'DELIVERY' ? (subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE) : 0
    const total = subtotal + deliveryFee

    const restaurant = await getOrCreateRestaurant()

    // Upsert profile if user is logged in
    if (user) {
      await prisma.profile.upsert({
        where: { id: user.id },
        update: { email: user.email!, updatedAt: new Date() },
        create: { id: user.id, email: user.email!, fullName: name, phone },
      })
    }

    // Resolve saved address ID
    let resolvedAddressId: string | undefined = undefined
    if (user && addressId) resolvedAddressId = addressId

    // Generate unique order number (retry on collision)
    let orderNumber = generateOrderNumber()
    const exists = await prisma.order.findUnique({ where: { orderNumber } })
    if (exists) orderNumber = generateOrderNumber()

    // Create order + items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          restaurantId: restaurant.id,
          profileId: user?.id ?? null,
          addressId: resolvedAddressId ?? null,
          orderNumber,
          type: type as 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN',
          status: 'PENDING',
          paymentStatus: paymentMethod === 'CASH' ? 'UNPAID' : 'UNPAID',
          paymentMethod: paymentMethod ?? 'CASH',
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          notes: notes ?? null,
          guestName: !user ? name : null,
          guestPhone: !user ? phone : null,
          guestEmail: !user && email ? email : null,
          // Store delivery address inline for guests
          ...(type === 'DELIVERY' && !resolvedAddressId ? {
            notes: [
              notes,
              `Delivery to: ${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city} ${pincode}${landmark ? ' (near ' + landmark + ')' : ''}`,
            ].filter(Boolean).join(' | '),
          } : {}),
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: items.map((i: { id: string; name: string; price: number; quantity: number }) => ({
          orderId: newOrder.id,
          menuItemId: null,   // will be linked when menu items are seeded to DB
          itemName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
        })),
      })

      return newOrder
    })

    await prisma.eventLog.create({
      data: {
        event: 'order_create',
        level: 'info',
        userId: user?.id ?? null,
        payload: { orderNumber: order.orderNumber, type, total, itemCount: items.length },
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id })
  } catch (err) {
    console.error('Order creation error:', err)
    await prisma.eventLog.create({
      data: { event: 'order_create', level: 'error', error: String(err) },
    }).catch(() => {})
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
