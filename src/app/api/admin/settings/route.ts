import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

const RESTAURANT_SLUG = 'arabic-heaven-mandi'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const r = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: r.id, name: r.name, phone: r.phone, email: r.email,
    address: r.address, city: r.city, tableCapacity: r.tableCapacity, upiId: r.upiId,
  })
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { tableCapacity, upiId, phone, email } = body

  const r = await prisma.restaurant.findFirst({ where: { slug: RESTAURANT_SLUG } })
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (tableCapacity !== undefined) data.tableCapacity = Number(tableCapacity)
  if (upiId !== undefined)         data.upiId = upiId
  if (phone !== undefined)         data.phone = phone
  if (email !== undefined)         data.email = email

  const updated = await prisma.restaurant.update({ where: { id: r.id }, data })
  return NextResponse.json({ ok: true, tableCapacity: updated.tableCapacity, upiId: updated.upiId })
}
