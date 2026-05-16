import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { status } = await req.json()
  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

  const updated = await prisma.order.update({ where: { id }, data: { status } })
  return NextResponse.json({ ok: true, status: updated.status })
}
