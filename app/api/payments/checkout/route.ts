import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { dealId, amount, description, paymentPhase } = await req.json()
    
    // Tagging the reference ensures the webhook knows which phase was paid
    const referenceTag = `${dealId}_${paymentPhase.toUpperCase()}`

    // PAYMONGO INTEGRATION
    // Once you have your keys, uncomment the block below.
    /*
    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY
    const encodedKey = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${encodedKey}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true, // Auto-receipts for User & Company
            payment_method_types: ['gcash', 'paymaya', 'qrph', 'card'],
            reference_number: referenceTag,
            line_items: [{
              currency: 'PHP',
              amount: Math.round(amount * 100), // Convert to centavos
              description: `${description} (${paymentPhase})`,
              name: 'Dishpatch Commission',
              quantity: 1
            }],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/ledger?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/ledger?canceled=true`
          }
        }
      })
    })
    const data = await response.json()
    return NextResponse.json({ checkoutUrl: data.data.attributes.checkout_url })
    */

    // MOCK FOR DEVELOPMENT
    return NextResponse.json({ 
      checkoutUrl: `/ledger?mock_success=true&tag=${referenceTag}` 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Checkout initialization failed' }, { status: 500 })
  }
}