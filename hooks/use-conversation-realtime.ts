"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Props {
  conversationId: string
  onMessage: (message: any) => void
}

export function useConversationRealtime({
  conversationId,
  onMessage,
}: Props) {
  useEffect(() => {
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
        (payload) => {
          onMessage(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, onMessage])
}