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

export async function POST(request: Request) {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, name, category, price, imageUrl, adding } = await request.json()
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  const admin = adminClient()

  if (adding) {
    // Upsert profile first so FK is satisfied
    await admin.from('profiles').upsert(
      { id: user.id, email: user.email!, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    await admin.from('user_favourites').upsert({
      profile_id: user.id,
      item_id: itemId,
      item_name: name,
      item_category: category,
      item_price: price,
      item_image_url: imageUrl ?? null,
    }, { onConflict: 'profile_id,item_id' })
  } else {
    await admin
      .from('user_favourites')
      .delete()
      .eq('profile_id', user.id)
      .eq('item_id', itemId)
  }

  return NextResponse.json({ success: true })
}
