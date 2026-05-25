"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptBookingAndProvisionChat(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized access." }
  }

  // 1. Verify the booking belongs to this chef and is pending
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, chef_id, client_id, status")
    .eq("id", bookingId)
    .single()

  if (fetchError || booking?.chef_id !== user.id) {
    return { success: false, error: "Booking not found or access denied." }
  }

  if (booking.status !== "pending") {
    return { success: false, error: "This booking has already been processed." }
  }

  // 2. Mark the booking as accepted
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "accepted" })
    .eq("id", bookingId)

  if (updateError) {
    return { success: false, error: "Failed to update booking status." }
  }

  // 3. Provision the secure Escrow Chat Room
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      conversation_type: "booking",
      booking_id: bookingId,
      chef_id: booking.chef_id,
      client_id: booking.client_id,
      status: "open"
    })
    .select("id")
    .single()

  if (convError) {
    console.error("Chat Provisioning Error:", convError)
    return { success: false, error: "Booking accepted, but chat creation failed." }
  }

  // 4. Clear the router cache so the sidebar updates instantly
  revalidatePath("/admin-dashboard")
  revalidatePath("/messages")

  // Return the new chat ID so the frontend can redirect the chef instantly
  return { success: true, conversationId: conversation.id }
}