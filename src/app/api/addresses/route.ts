import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const addresses = await prisma.address.findMany({
      where: { profileId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(addresses.map((a) => ({
      id: a.id, label: a.label, line1: a.line1, line2: a.line2,
      city: a.city, pincode: a.pincode, landmark: a.landmark, is_default: a.isDefault,
    })))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, line1, line2, city, pincode, landmark } = await request.json()
  if (!line1 || !city || !pincode)
    return NextResponse.json({ error: 'line1, city and pincode are required' }, { status: 400 })

  try {
    // Upsert profile for FK constraint
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email!, updatedAt: new Date() },
      create: { id: user.id, email: user.email!, fullName: user.user_metadata?.full_name ?? null },
    })

    const count = await prisma.address.count({ where: { profileId: user.id } })

    const address = await prisma.address.create({
      data: {
        profileId: user.id,
        label: label ?? 'Home',
        line1, line2: line2 || null,
        city, pincode,
        landmark: landmark || null,
        isDefault: count === 0,
      },
    })

    return NextResponse.json({
      id: address.id, label: address.label, line1: address.line1, line2: address.line2,
      city: address.city, pincode: address.pincode, landmark: address.landmark, is_default: address.isDefault,
    }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
  }
}
