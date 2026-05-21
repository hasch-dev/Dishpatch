"use server"

import { sendMessage } from "@/lib/messaging/send-message"

export async function sendMessageAction(formData: FormData) {
  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string

  if (!conversationId || !content.trim()) {
    throw new Error("Invalid message")
  }

  return await sendMessage({
    conversationId,
    content,
  })
}