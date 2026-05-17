import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { capacity, isActive } = await req.json()

  const table = await prisma.diningTable.update({
    where: { id },
    data: {
      ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })
  return NextResponse.json({ ok: true, table })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  await prisma.diningTable.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
