import { createClient } from "@/lib/supabase/server"

export async function fetchConversation(conversationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      booking:booking_id(*),
      participants:conversation_participants(
        *,
        profile:profiles(*)
      ),
      messages(
        *
      )
    `)
    .eq("id", conversationId)
    .order("created_at", {
      foreignTable: "messages",
      ascending: true,
    })
    .maybeSingle() // Use maybeSingle to prevent crashing on missing rows or RLS failures

  if (error) {
    console.error("Database fetch error in fetchConversation:", error)
    return null
  }

  return data
}