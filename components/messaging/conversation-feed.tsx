"use client"

import { useEffect, useState } from "react"

import { subscribeConversation } from "@/lib/messaging/subscribe-conversation"

import { MessageBubble } from "./message-bubble"

interface Props {
  messages: any[]
  currentUserId: string
}

export function ConversationFeed({
  messages: initialMessages,
  currentUserId,
}: Props) {
  const [messages, setMessages] = useState(initialMessages)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    if (!initialMessages?.[0]?.conversation_id) return

    const channel = subscribeConversation(
      initialMessages[0].conversation_id,
      (payload) => {
        setMessages((prev) => {
          const exists = prev.some(
            (message) => message.id === payload.new.id
          )

          if (exists) return prev

          return [...prev, payload.new]
        })
      }
    )

    return () => {
      channel.unsubscribe()
    }
  }, [initialMessages])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
        />
      ))}
    </div>
  )
}