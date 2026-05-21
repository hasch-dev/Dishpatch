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
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}