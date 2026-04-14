import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('master')
    .select(`
      *,
      chef_details (*)
    `)
    .eq('id', user.id)
    .single()

  if (error) throw error

  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Update master
  await supabase.from('master').update({
    display_name: body.display_name,
    bio: body.bio,
    phone: body.phone,
    location_address: body.location_address,
  }).eq('id', user.id)

  // If chef → update chef_details
  if (body.user_type === 'chef') {
    await supabase.from('chef_details').upsert({
      id: user.id,
      cuisine_types: body.cuisine_types,
      experience_years: body.experience_years,
      session_rate: body.session_rate,
      chef_title: body.chef_title,
      offers_consultation: body.offers_consultation,
      consultation_rate: body.consultation_rate,
    })
  }

  return NextResponse.json({ success: true })
}