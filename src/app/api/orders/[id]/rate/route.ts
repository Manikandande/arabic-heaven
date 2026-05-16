import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = adminClient()

  // Rating an individual item
  if (body.itemId && body.itemRating) {
    const { error } = await admin
      .from('order_items')
      .update({ item_rating: body.itemRating })
      .eq('id', body.itemId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Rating the overall order
  if (body.rating) {
    const { error } = await admin
      .from('orders')
      .update({ rating: body.rating, rated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('profile_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Provide rating or itemId+itemRating' }, { status: 400 })
}
