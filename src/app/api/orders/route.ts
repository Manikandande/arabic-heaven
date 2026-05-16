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

export async function GET() {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data, error } = await admin
    .from('orders')
    .select(`
      id, order_number, type, status, subtotal, delivery_fee, discount, total,
      rating, created_at,
      items:order_items(
        id, quantity, unit_price, total_price, item_rating,
        menu_item:menu_items(name)
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Flatten menu item name onto each order item
  const orders = (data ?? []).map((order) => ({
    ...order,
    items: (order.items as any[]).map((item) => ({
      id: item.id,
      name: item.menu_item?.name ?? 'Unknown item',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      item_rating: item.item_rating ?? null,
    })),
  }))

  return NextResponse.json(orders)
}
