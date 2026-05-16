import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

const RESTAURANT_SLUG = 'arabic-heaven-mandi'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const restaurant = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
  return NextResponse.json({ soldOutItems: restaurant?.soldOutItems ?? [] })
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { itemId, available } = await req.json()
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

  const current = restaurant.soldOutItems
  const updated = available
    ? current.filter((id: string) => id !== itemId)
    : [...current.filter((id: string) => id !== itemId), itemId]

  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { soldOutItems: updated } })
  return NextResponse.json({ ok: true, soldOutItems: updated })
}
