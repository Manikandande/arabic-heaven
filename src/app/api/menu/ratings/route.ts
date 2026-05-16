import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns avg community rating per item (keyed by itemName lowercase).
// Only includes items with ≥2 ratings so a single outlier doesn't skew the badge.
export async function GET() {
  try {
    const rows = await prisma.orderItem.groupBy({
      by: ['itemName'],
      where: { itemRating: { not: null } },
      _avg: { itemRating: true },
      _count: { itemRating: true },
    })

    const result: Record<string, { avg: number; count: number }> = {}
    for (const row of rows) {
      const count = row._count.itemRating ?? 0
      if (count >= 2) {
        result[row.itemName.toLowerCase()] = {
          avg: Math.round((row._avg.itemRating ?? 0) * 10) / 10,
          count,
        }
      }
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Ratings fetch error:', err)
    return NextResponse.json({})
  }
}
