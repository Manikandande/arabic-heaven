import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  try {
    // Rating an individual item
    if (body.itemId && body.itemRating) {
      await prisma.orderItem.update({
        where: { id: body.itemId },
        data: { itemRating: body.itemRating },
      })
      return NextResponse.json({ success: true })
    }

    // Rating the overall order
    if (body.rating) {
      await prisma.order.update({
        where: { id: orderId, profileId: user.id },
        data: { rating: body.rating, ratedAt: new Date() },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Provide rating or itemId+itemRating' }, { status: 400 })
  } catch (err) {
    console.error('Rating error:', err)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
