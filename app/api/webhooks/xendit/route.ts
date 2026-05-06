import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    // 1. Verify webhook token
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (!webhookToken) {
      console.error('Missing XENDIT_WEBHOOK_TOKEN');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const callbackToken = req.headers.get('x-callback-token');

    if (callbackToken !== webhookToken) {
      console.error('Invalid Xendit Webhook Token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await req.json();

    if (body.status !== 'PAID') {
      return NextResponse.json(
        { message: 'Ignored non-paid event' },
        { status: 200 }
      );
    }

    const { external_id, id: invoice_id } = body;

    // 3. Parse external_id safely
    const [prefix, dealId, paymentPhase] = external_id.split('_');

    if (prefix !== 'DISH' || !dealId || !paymentPhase) {
      return NextResponse.json(
        { message: 'Invalid external_id format' },
        { status: 200 }
      );
    }

    // 4. Prepare update
    const updateData: Record<string, any> = {
      xendit_invoice_id: invoice_id,
    };

    if (paymentPhase === 'DEPOSIT') {
      updateData.deposit_paid = true;
      updateData.deposit_paid_at = new Date().toISOString();
    } else if (paymentPhase === 'FINAL') {
      updateData.final_paid = true;
      updateData.final_paid_at = new Date().toISOString();
    }

    // 5. Update DB (lazy init here)
    const supabaseAdmin = getSupabaseAdmin();

    const { error: updateError } = await supabaseAdmin
      .from('deals')
      .update(updateData)
      .eq('id', dealId);

    if (updateError) {
      console.error('Supabase update failed:', updateError);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // 6. Success response
    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}