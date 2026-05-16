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
    .from('addresses')
    .select('*')
    .eq('profile_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { label, line1, line2, city, pincode, landmark } = body

  if (!line1 || !city || !pincode) {
    return NextResponse.json({ error: 'line1, city and pincode are required' }, { status: 400 })
  }

  const admin = adminClient()

  // Upsert profile so FK constraint is satisfied
  await admin.from('profiles').upsert({
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  // If this is the first address, make it default
  const { count } = await admin
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const { data, error } = await admin
    .from('addresses')
    .insert({
      profile_id: user.id,
      label: label ?? 'Home',
      line1,
      line2: line2 || null,
      city,
      pincode,
      landmark: landmark || null,
      is_default: count === 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
