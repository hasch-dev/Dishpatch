import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SupportRoutingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/messages")

  // 1. Look for an existing open support ticket for this user
  const { data: existingSupport } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", user.id)
    .eq("conversation_type", "support")
    .eq("status", "open")
    .maybeSingle()

  if (existingSupport) {
    // If they have one, send them straight to that UUID room
    redirect(`/messages/${existingSupport.id}`)
  }

  // 2. If no active ticket exists, provision a new one
  const { data: newSupport, error } = await supabase
    .from("conversations")
    .insert({
      client_id: user.id,
      conversation_type: "support",
      status: "open"
    })
    .select("id")
    .single()

  if (newSupport) {
    // Send them to their brand new UUID room
    redirect(`/messages/${newSupport.id}`)
  }

  // Fallback in case of database failure
  console.error("Support Provisioning Error:", error)
  redirect("/messages")
}