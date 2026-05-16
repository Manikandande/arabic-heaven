import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const RESTAURANT_SLUG = 'arabic-heaven-mandi'
const DEPOSIT_AMOUNT  = 50

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to make a reservation' }, { status: 401 })

  try {
    const body = await req.json()
    const { date, timeSlot, partySize, name, phone, email, notes, utrNumber } = body

    if (!date || !timeSlot || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 500 })

    // Capacity check
    const from = new Date(`${date}T00:00:00.000Z`)
    const to   = new Date(`${date}T23:59:59.999Z`)
    const existing = await prisma.reservation.count({
      where: {
        restaurantId: restaurant.id,
        date: { gte: from, lte: to },
        timeSlot,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    })
    if (existing >= restaurant.tableCapacity) {
      return NextResponse.json({ error: 'This slot is now full. Please choose another time.' }, { status: 409 })
    }

    // Upsert profile
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email!, updatedAt: new Date() },
      create: { id: user.id, email: user.email!, fullName: name, phone },
    })

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        profileId:    user.id,
        guestName:    name,
        guestPhone:   phone,
        guestEmail:   email || user.email || null,
        partySize:    Number(partySize),
        date:         new Date(`${date}T00:00:00.000Z`),
        timeSlot,
        notes:        notes || null,
        status:       'PENDING',
        depositAmount: DEPOSIT_AMOUNT,
        depositPaid:  false,
        utrNumber:    utrNumber || null,
      },
    })

    await prisma.eventLog.create({
      data: {
        event:   'reservation_create',
        level:   'info',
        userId:  user.id,
        payload: { reservationId: reservation.id, date, timeSlot, partySize },
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, reservationId: reservation.id })
  } catch (err) {
    console.error('Reservation create error:', err)
    await prisma.eventLog.create({
      data: { event: 'reservation_create', level: 'error', userId: user.id, error: String(err) },
    }).catch(() => {})
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
