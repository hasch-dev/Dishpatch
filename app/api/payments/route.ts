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
    const { dealId, paymentType } = body // 'deposit' or 'final'

    // Get deal information
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Verify user is involved in the deal
    if (user.id !== deal.user_id && user.id !== deal.chef_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For now, return a mock response
    // In production, this would create a Stripe Checkout session
    const amount = paymentType === 'deposit' ? deal.deposit_amount : deal.final_amount
    
    return NextResponse.json({
      clientSecret: `mock_secret_${dealId}_${paymentType}`,
      amount: Math.round(amount * 100), // Stripe uses cents
      paymentType,
      dealId,
    })
  } catch (error) {
    console.error('Payment session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Session creation failed' },
      { status: 500 }
    )
  }
}
