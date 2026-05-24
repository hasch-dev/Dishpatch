// lib/messaging/subscribe.ts

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function subscribeToConversation(
  conversationId: string,
  onMessage: (payload: any) => void
) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      onMessage
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}