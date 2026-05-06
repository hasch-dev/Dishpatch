import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    // ✅ Ensure API key exists before doing anything
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return new NextResponse('Email service not configured', { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { bookingId } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Fetch booking, client, and chef details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        client:user_id (email, raw_user_meta_data),
        chef:chef_id (email, raw_user_meta_data)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    // Ensure only the chef can complete the booking
    if (booking.chef_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // 2. Trigger payout
    const { error: rpcError } = await supabase.rpc('complete_booking_payout', {
      booking_id_param: bookingId,
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return new NextResponse(rpcError.message, { status: 500 });
    }

    // 3. Send email (non-blocking failure)
    try {
      await resend.emails.send({
        // ⚠️ Use this for testing ONLY
        from: 'onboarding@resend.dev',

        to: [booking.client.email, booking.chef.email],
        subject: `Service Completed: ${booking.title}`,

        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; padding: 40px;">
            <h1 style="font-style: italic; font-weight: normal;">
              Service Rendered & Funded
            </h1>

            <p>
              The commission <strong>${booking.title}</strong> has been marked as complete.
            </p>

            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />

            <p><strong>Total Settled:</strong> ₱${booking.final_price?.toLocaleString() ?? '0'}</p>

            <p style="font-size: 12px; color: #666; margin-top: 40px;">
              Thank you for using Dishpatch. The artisan's ledger has been credited.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email failed to send:', emailError);
      // Do NOT fail request if email fails
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}