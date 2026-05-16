import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { status, depositPaid } = body

  const data: Record<string, unknown> = {}
  if (status)                            data.status = status
  if (status === 'CONFIRMED')            data.confirmedAt = new Date()
  if (depositPaid !== undefined)         data.depositPaid = depositPaid

  const updated = await prisma.reservation.update({ where: { id }, data })
  return NextResponse.json({ ok: true, status: updated.status, depositPaid: updated.depositPaid })
}
