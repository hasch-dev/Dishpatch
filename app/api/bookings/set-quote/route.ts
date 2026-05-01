import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  const { bookingId, finalPrice } = await req.json();
  const supabase = await createClient();
  
  // Verify the user is the chef assigned to this booking
  const { data: { user } } = await supabase.auth.getUser();
  const { data: booking } = await supabase
    .from('bookings')
    .select('chef_id')
    .eq('id', bookingId)
    .single();

  if (!user || booking?.chef_id !== user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { error } = await supabase
    .from('bookings')
    .update({ 
      final_price: finalPrice,
      status: 'awaiting_payment' // Move the booking to the next phase
    })
    .eq('id', bookingId);

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ success: true });
}