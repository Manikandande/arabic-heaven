import { NextResponse } from 'next/server'
import { createClient as serverClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  try {
    if (body.is_default === true) {
      // Clear existing defaults first
      await prisma.address.updateMany({ where: { profileId: user.id }, data: { isDefault: false } })
    }
    const address = await prisma.address.update({
      where: { id, profileId: user.id },
      data: body.is_default !== undefined ? { isDefault: body.is_default } : body,
    })
    return NextResponse.json({ id: address.id, is_default: address.isDefault })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.address.delete({ where: { id, profileId: user.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
