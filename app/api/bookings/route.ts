import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description,
        event_date: body.event_date,
        event_time: body.event_time,
        guest_count: body.guest_count,
        dietary_restrictions: body.dietary_restrictions,
        budget: body.budget,
        location_address: body.location_address,
        location_lat: body.location_lat,
        location_lng: body.location_lng,
        status: 'open',
      })
      .select()
      .single()
    
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (bookingId) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) throw error
      return NextResponse.json({ data })
    }

    // Get user's bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
