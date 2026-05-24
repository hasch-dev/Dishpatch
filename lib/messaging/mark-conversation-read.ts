"use server"

import { createClient } from "@/lib/supabase/server"

export async function markConversationRead(
  conversationId: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: messages } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)

  if (!messages?.length) return

  const inserts = messages.map((message) => ({
    message_id: message.id,
    user_id: user.id,
  }))

  await supabase
    .from("message_reads")
    .upsert(inserts, {
      onConflict: "message_id,user_id",
    })
}