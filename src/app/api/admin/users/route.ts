import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { email, name, password } = await req.json()
  if (!email || !name || !password) return NextResponse.json({ error: 'email, name and password are required' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 })

  const passwordHash = await hash(password, 12)
  const user = await prisma.adminUser.create({
    data: { email: email.toLowerCase(), name: name.trim(), passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return NextResponse.json({ user })
}
