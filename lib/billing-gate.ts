import { createClient } from '@/lib/supabase/server'

/**
 * Checks if a user is restricted from making new bookings
 * due to unpaid previous commissions.
 */
export async function isUserLocked(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('deals')
    .select('id')
    .eq('final_paid', false)
    .innerJoin('bookings', 'booking_id', 'id')
    .eq('bookings.user_id', userId)

  if (error) return false
  return (data?.length ?? 0) > 0
}