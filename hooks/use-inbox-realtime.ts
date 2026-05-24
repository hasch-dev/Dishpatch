"use client"

import { useEffect } from "react"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface UseInboxRealtimeProps {
  onNewMessage?: (payload: any) => void
  onConversationUpdate?: (payload: any) => void
}

export function useInboxRealtime({
  onNewMessage,
  onConversationUpdate,
}: UseInboxRealtimeProps = {}) {
  useEffect(() => {
    /**
     * MESSAGE INSERTS
     */
    const messageChannel = supabase
      .channel("inbox-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          onNewMessage?.(payload)
        }
      )
      .subscribe()

    /**
     * CONVERSATION UPDATES
     */
    const conversationChannel = supabase
      .channel("inbox-conversations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          onConversationUpdate?.(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(conversationChannel)
    }
  }, [onNewMessage, onConversationUpdate])
}