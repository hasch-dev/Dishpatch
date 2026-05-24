// lib/messaging/fetch-messages.ts

import { createClient } from "@/lib/supabase/server"

export async function fetchMessages(conversationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (
        id,
        display_name,
        user_type,
        chef_image_url
      ),
      reads:message_reads (
        user_id,
        read_at
      )
    `)
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Fetch Messages Error:", error)
    return []
  }

  return data ?? []
}