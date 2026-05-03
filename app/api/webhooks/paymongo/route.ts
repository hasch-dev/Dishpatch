import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const payload = await req.json()
  
  if (payload.data.attributes.type === 'checkout_session.payment.paid') {
    const { reference_number } = payload.data.attributes.data.attributes
    const [dealId, phase] = reference_number.split('_')

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Uses Service Role to bypass RLS
    )

    if (phase === 'DEPOSIT') {
      await supabaseAdmin.from('deals').update({ deposit_paid: true }).eq('id', dealId)
      // Transition booking to assigned status
      const { data } = await supabaseAdmin.from('deals').select('booking_id').eq('id', dealId).single()
      if (data) await supabaseAdmin.from('bookings').update({ status: 'assigned' }).eq('id', data.booking_id)
    } else {
      await supabaseAdmin.from('deals').update({ final_paid: true }).eq('id', dealId)
    }
  }

  return NextResponse.json({ received: true })
}