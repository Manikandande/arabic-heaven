import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_ROLES = ['ADMIN', 'MANAGER'] as const

// Server component helper — redirects if not admin
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/admin')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || !ADMIN_ROLES.includes(profile.role as typeof ADMIN_ROLES[number])) {
    redirect('/')
  }
  return { user, profile }
}

// API route helper — returns 401/403 if not admin
export async function verifyAdmin(req: NextRequest): Promise<
  { ok: true; userId: string } | NextResponse
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || !ADMIN_ROLES.includes(profile.role as typeof ADMIN_ROLES[number])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return { ok: true, userId: user.id }
}
