import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, proposalId, chefId } = body

    // Validate booking ownership
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    const depositAmount = proposal.proposed_price / 2

    const { data, error } = await supabase
      .from('deals')
      .insert({
        booking_id: bookingId,
        proposal_id: proposalId,
        chef_id: chefId,
        agreed_price: proposal.proposed_price,
        deposit_amount: depositAmount,
        final_amount: proposal.proposed_price - depositAmount,
        deposit_paid: false,
        final_paid: false,
      })
      .select()
      .single()

    if (error) throw error

    // Update booking
    await supabase
      .from('bookings')
      .update({
        status: 'deal_locked',
        chef_id: chefId,
      })
      .eq('id', bookingId)

    // Update proposal
    await supabase
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('id', proposalId)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Deal creation error:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    let query = supabase.from('deals').select('*')

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    } else {
      // ✅ SAFE (no user_id assumption)
      query = query.eq('chef_id', user.id)
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Deals fetch error:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dealId, depositPaid, finalPaid } = body

    const { data, error } = await supabase
      .from('deals')
      .update({
        deposit_paid: depositPaid ?? undefined,
        final_paid: finalPaid ?? undefined,
      })
      .eq('id', dealId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Deal update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 500 }
    )
  }
}