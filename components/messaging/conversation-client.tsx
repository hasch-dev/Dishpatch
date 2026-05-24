"use client"

import { useEffect } from "react"

import { useConversation } from "@/hooks/use-conversation"

import { markConversationRead } from "@/lib/messaging/mark-conversation-read"

import { ConversationFeed } from "./conversation-feed"
import { ConversationInput } from "./conversation-input"

interface Props {
  conversation: any
  currentUserId: string
}

export function ConversationClient({
  conversation,
  currentUserId,
}: Props) {
  const { messages } = useConversation({
    initialMessages:
      conversation.messages ?? [],
    conversationId: conversation.id,
  })

  useEffect(() => {
    markConversationRead(conversation.id)
  }, [conversation.id, messages])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ConversationFeed
        messages={messages}
        currentUserId={currentUserId}
      />

      <ConversationInput
        conversationId={conversation.id}
      />
    </div>
  )
}