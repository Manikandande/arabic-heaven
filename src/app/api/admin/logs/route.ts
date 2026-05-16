import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')
  const event = searchParams.get('event')

  const where: Record<string, unknown> = {}
  if (level && level !== 'all') where.level = level
  if (event && event !== 'all') where.event = event

  const logs = await prisma.eventLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(logs)
}
