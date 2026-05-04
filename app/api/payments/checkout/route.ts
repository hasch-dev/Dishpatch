// app/api/payments/checkout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dealId, amount, description, paymentPhase, clientEmail } = await req.json()
    
    // The external_id is crucial. It tells your webhook exactly what to update later.
    const externalId = `DISH_${dealId}_${paymentPhase.toUpperCase()}`

    const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY
    if (!XENDIT_SECRET_KEY) {
      console.warn("Missing Xendit Key. Returning mock URL.")
      return NextResponse.json({ 
        checkoutUrl: `/payments?mock_success=true&deal=${dealId}` 
      })
    }

    const encodedKey = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64')

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedKey}`
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: amount, // Xendit uses standard amounts for PHP (e.g., 5000 = ₱5,000)
        description: `Dishpatch: ${description} (${paymentPhase} phase)`,
        invoice_duration: 86400, // 24 hours to pay
        customer: {
          email: clientEmail || user.email,
        },
        currency: 'PHP',
        success_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payments?success=true&deal=${dealId}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payments?canceled=true`
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Xendit Error:", data)
      return NextResponse.json({ error: data.message || 'Payment gateway error' }, { status: 400 })
    }

    // Xendit returns the hosted checkout URL as 'invoice_url'
    return NextResponse.json({ checkoutUrl: data.invoice_url })

  } catch (error) {
    console.error("Checkout Exception:", error)
    return NextResponse.json({ error: 'Checkout initialization failed' }, { status: 500 })
  }
}