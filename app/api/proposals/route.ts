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
    
    // Create proposal
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        booking_id: body.booking_id,
        chef_id: user.id,
        proposed_price: body.proposed_price,
        menu_description: body.menu_description,
        availability_notes: body.availability_notes,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) throw error

    // Update booking status if this is first proposal
    const { data: booking } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', body.booking_id)
      .single()

    if (booking?.status === 'open') {
      await supabase
        .from('bookings')
        .update({ status: 'proposals_received' })
        .eq('id', body.booking_id)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Proposal creation error:', error)
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

    let query = supabase
      .from('proposals')
      .select(`
        *,
        booking:bookings(user_id),
        chef:master(display_name, avatar_url)
      `)

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    } else {
      // Get proposals for the current user (either as recipient or sender)
      query = query.or(`chef_id.eq.${user.id},booking.user_id.eq.${user.id}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Proposals fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { proposalId, status } = body

    // Update proposal status
    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', proposalId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Proposal update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}
