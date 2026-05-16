import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Count how many users have each item favourited
    const { data, error } = await admin
      .from('user_favourites')
      .select('item_id, item_name, item_category, item_price, item_image_url')

    if (error) return NextResponse.json([])

    // Aggregate counts in memory
    const counts = new Map<string, { itemId: string; name: string; category: string; price: number; imageUrl: string | null; count: number }>()
    for (const row of data ?? []) {
      const existing = counts.get(row.item_id)
      if (existing) {
        existing.count++
      } else {
        counts.set(row.item_id, {
          itemId: row.item_id,
          name: row.item_name,
          category: row.item_category,
          price: Number(row.item_price),
          imageUrl: row.item_image_url ?? null,
          count: 1,
        })
      }
    }

    const popular = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return NextResponse.json(popular)
  } catch {
    return NextResponse.json([])
  }
}
