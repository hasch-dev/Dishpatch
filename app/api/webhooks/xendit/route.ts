// app/api/webhooks/xendit/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    try {
    // 1. Verify the request actually came from Xendit
    const callbackToken = req.headers.get('x-callback-token')
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
        console.error('Invalid Xendit Webhook Token')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse the webhook payload
    const body = await req.json()
    
    // We only care about successfully paid invoices
    if (body.status !== 'PAID') {
        return NextResponse.json({ message: 'Ignored non-paid event' }, { status: 200 })
    }

    const { external_id, id: invoice_id } = body

    // 3. Extract the Deal ID and Payment Phase from our custom external_id
    // Expected format from our checkout route: DISH_1234-uuid-5678_DEPOSIT or DISH_1234-uuid-5678_FINAL
    const parts = external_id.split('_')
    if (parts.length !== 3 || parts[0] !== 'DISH') {
        return NextResponse.json({ message: 'Irrelevant external_id format' }, { status: 200 })
    }

    const dealId = parts[1]
    const paymentPhase = parts[2] // 'DEPOSIT' or 'FINAL'

    // 4. Update the Database using the Admin Client
    const updateData: any = {
        xendit_invoice_id: invoice_id,
    }

    if (paymentPhase === 'DEPOSIT') {
        updateData.deposit_paid = true
        updateData.deposit_paid_at = new Date().toISOString()
    } else if (paymentPhase === 'FINAL') {
        updateData.final_paid = true
        updateData.final_paid_at = new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
        .from('deals')
        .update(updateData)
        .eq('id', dealId)

    if (updateError) {
        console.error('Supabase update failed:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // 5. Acknowledge receipt to Xendit
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 })

    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}