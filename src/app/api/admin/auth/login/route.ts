import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })
  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await compare(password, admin.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signAdminToken(admin.id)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
