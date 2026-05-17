import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { isActive, role } = await req.json()

  const updated = await prisma.staffMember.update({
    where: { id },
    data: {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(role ? { role } : {}),
    },
  })

  return NextResponse.json({ ok: true, isActive: updated.isActive, role: updated.role })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  await prisma.staffMember.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
