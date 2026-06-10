"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function ConversationTracker({ conversationId }: { conversationId: string }) {
  useEffect(() => {
    const markConversationAsRead = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pushes the current timestamp to the database to clear the unread badge
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
    }

    markConversationAsRead()
  }, [conversationId])

  return null // This component is strictly functional and invisible
}