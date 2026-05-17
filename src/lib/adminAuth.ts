import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME    = 'admin_token'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

function secret(): Uint8Array | null {
  const s = process.env.ADMIN_JWT_SECRET
  if (!s) return null
  return new TextEncoder().encode(s)
}

export async function signAdminToken(adminId: string): Promise<string> {
  const key = secret()
  if (!key) throw new Error('ADMIN_JWT_SECRET is not configured')
  return new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key)
}

async function verifyAdminToken(token: string): Promise<string | null> {
  try {
    const key = secret()
    if (!key) return null
    const { payload } = await jwtVerify(token, key)
    return payload.sub ?? null
  } catch {
    return null
  }
}

// Server component helper — always redirects to /admin/login if not authenticated
export async function requireAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) redirect('/admin/login')

    const adminId = await verifyAdminToken(token)
    if (!adminId) redirect('/admin/login')

    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!admin) redirect('/admin/login')

    return admin
  } catch (err: any) {
    // redirect() throws internally — let it propagate
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    // Any other error (missing secret, DB down, etc.) → send to login
    redirect('/admin/login')
  }
}

// API route helper — returns 401 if not authenticated
export async function verifyAdmin(req: NextRequest): Promise<
  { ok: true; adminId: string } | NextResponse
> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminId = await verifyAdminToken(token)
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return { ok: true, adminId }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE }
