"use client"

import { useCallback, useEffect, useState } from "react"

import { useConversationRealtime } from "./use-conversation-realtime"

interface Props {
  initialMessages: any[]
  conversationId: string
}

export function useConversation({
  initialMessages,
  conversationId,
}: Props) {
  const [messages, setMessages] =
    useState(initialMessages)

  const handleIncomingMessage = useCallback(
    (message: any) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.id === message.id
        )

        if (exists) return prev

        return [...prev, message]
      })
    },
    []
  )

  useConversationRealtime({
    conversationId,
    onMessage: handleIncomingMessage,
  })

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  return {
    messages,
    setMessages,
  }
}