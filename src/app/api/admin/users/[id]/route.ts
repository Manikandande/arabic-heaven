import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  if (id === auth.adminId) return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })

  await prisma.adminUser.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
