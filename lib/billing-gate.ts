import { createClient } from '@/lib/supabase/server'

/**
 * Checks if a user is restricted from making new bookings
 * due to unpaid previous commissions.
 */
export async function isUserLocked(userId: string) {
  const supabase = await createClient()
  
  // Use !inner filter inside the select query for relational matching
  const { data, error } = await supabase
    .from('deals')
    .select('id, bookings!inner(user_id)')
    .eq('final_paid', false)
    .eq('bookings.user_id', userId)

  if (error) {
    console.error("Error checking user lock status:", error)
    return false
  }
  return (data?.length ?? 0) > 0
}