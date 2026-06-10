import { createClient } from "@/lib/supabase/server"

export async function fetchConversation(conversationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      booking:bookings(*),
      participants:conversation_participants(
        *,
        profile:profiles(*)
      ),
      messages!messages_conversation_id_fkey(
        *
      )
    `)
    .eq("id", conversationId)
    .order("created_at", {
      foreignTable: "messages", 
      ascending: true,
    })
    .maybeSingle() 

  if (error) {
    console.error("Database fetch error in fetchConversation:", JSON.stringify(error, null, 2))
    return null
  }

  return data
}