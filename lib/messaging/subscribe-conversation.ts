import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function subscribeConversation(
  conversationId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe()
}