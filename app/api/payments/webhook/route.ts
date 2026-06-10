import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-callback-token")

    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { external_id, status, paid_amount } = body
    const supabase = await createClient()

    if (status === "PAID") {
      // 1. Find the payment record
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("external_id", external_id)
        .single()

      if (!payment) {
        return new Response("Payment not found")
      }

      // 2. Mark payment as paid
      await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_amount
        })
        .eq("id", payment.id)

      // 3. Route updates based on payment type
      if (payment.payment_type === "deposit") {
        
        // Update Booking
        await supabase.from("bookings").update({
          deposit_paid: true,
          payment_status: "partially_paid",
          status: "confirmed" // Unlocks the dashboard
        }).eq("id", payment.booking_id)

        // Update Deal
        await supabase.from("deals").update({
          payment_status: "partially_paid",
          deposit_paid_at: new Date().toISOString()
        }).eq("id", payment.deal_id)

      } else {
        
        // Update Booking
        await supabase.from("bookings").update({
          final_paid: true,
          payment_status: "paid"
        }).eq("id", payment.booking_id)

        // Update Deal
        await supabase.from("deals").update({
          payment_status: "paid",
          final_paid_at: new Date().toISOString()
        }).eq("id", payment.deal_id)
      }
    }

    return new Response("ok")

  } catch (err) {
    console.error(err)
    return new Response("Server Error", { status: 500 })
  }
}