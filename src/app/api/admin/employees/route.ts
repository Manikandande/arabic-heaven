import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) return NextResponse.json({ staff: [] })

  const staff = await prisma.staffMember.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
  })

  const profileIds = staff.map(s => s.profileId)
  const profiles   = await prisma.profile.findMany({ where: { id: { in: profileIds } } })
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  return NextResponse.json({
    staff: staff.map(s => {
      const p = profileMap[s.profileId]
      return {
        id: s.id, role: s.role, isActive: s.isActive, createdAt: s.createdAt, profileId: s.profileId,
        name: p?.fullName ?? p?.email ?? 'Unknown',
        email: p?.email ?? '—',
        phone: p?.phone ?? null,
      }
    }),
  })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { email, role } = await req.json()
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })

  const restaurant = await prisma.restaurant.findFirst()
  if (!restaurant) return NextResponse.json({ error: 'No restaurant configured' }, { status: 500 })

  const profile = await prisma.profile.findUnique({ where: { email: email.toLowerCase() } })
  if (!profile) return NextResponse.json({ error: 'No registered user found with this email. The person must sign up first.' }, { status: 404 })

  const existing = await prisma.staffMember.findUnique({
    where: { restaurantId_profileId: { restaurantId: restaurant.id, profileId: profile.id } },
  })
  if (existing) return NextResponse.json({ error: 'This person is already a staff member' }, { status: 409 })

  const member = await prisma.staffMember.create({
    data: { restaurantId: restaurant.id, profileId: profile.id, role: role ?? 'STAFF' },
  })

  return NextResponse.json({
    member: {
      id: member.id, role: member.role, isActive: member.isActive, createdAt: member.createdAt,
      name: profile.fullName ?? profile.email, email: profile.email, phone: profile.phone,
    },
  })
}
