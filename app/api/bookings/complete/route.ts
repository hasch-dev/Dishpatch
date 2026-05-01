import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { bookingId } = await req.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  // 1. Fetch booking, client, and chef details for the email
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      client:user_id (email, raw_user_meta_data),
      chef:chef_id (email, raw_user_meta_data)
    `)
    .eq('id', bookingId)
    .single();

  if (booking?.chef_id !== user.id) {
    return new NextResponse('Unauthorized', { status: 400 });
  }

  // 2. Trigger the SQL balance transfer (from our previous step)
  const { error: rpcError } = await supabase.rpc('complete_booking_payout', {
    booking_id_param: bookingId
  });

  if (rpcError) return new NextResponse(rpcError.message, { status: 500 });

  // 3. Send the Receipt Emails
  try {
    await resend.emails.send({
      from: 'Dishpatch Studio <concierge@dishpatch.com>', // Update with your verified domain
      to: [booking.client.email, booking.chef.email],
      subject: `Service Completed: ${booking.title}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; padding: 40px;">
          <h1 style="font-style: italic; font-weight: normal;">Service Rendered & Funded</h1>
          <p>The commission <strong>${booking.title}</strong> has been marked as complete by the artisan.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Total Settled:</strong> ₱${booking.final_price?.toLocaleString()}</p>
          <p style="font-size: 12px; color: #666; margin-top: 40px;">
            Thank you for using Dishpatch. The artisan's ledger has been credited.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email failed to send:", emailError);
    // We don't fail the whole request if the email fails, since the money moved successfully
  }

  return NextResponse.json({ success: true });
}