"use server"

import { createClient } from "@/lib/supabase/server"

interface Params {
  conversationId: string
  content: string
  messageType?: string
  metadata?: any
}

export async function sendMessage({
  conversationId,
  content,
  messageType = "text",
  metadata = {},
}: Params) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
      metadata,
    })

  if (error) {
    console.error(error)
    throw error
  }

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
}