"use client"

import { useEffect, useState } from "react"

import { useInboxRealtime } from "./use-inbox-realtime"

interface Conversation {
  id: string
  created_at: string
  latestMessage?: {
    created_at: string
  }
}

interface Props {
  initialConversations: Conversation[]
}

export function useInbox({
  initialConversations,
}: Props) {
  const [conversations, setConversations] =
    useState<Conversation[]>(
      initialConversations
    )

  useInboxRealtime({
    onConversationUpdate: (
      updatedConversation: Conversation
    ) => {
      setConversations((prev) => {
        const exists = prev.some(
          (conversation) =>
            conversation.id ===
            updatedConversation.id
        )

        /**
         * NEW CONVERSATION
         */
        if (!exists) {
          return [
            updatedConversation,
            ...prev,
          ]
        }

        /**
         * UPDATE EXISTING
         */
        return prev
          .map((conversation) =>
            conversation.id ===
            updatedConversation.id
              ? updatedConversation
              : conversation
          )
          .sort((a, b) => {
            const aTime =
              a.latestMessage
                ?.created_at ??
              a.created_at

            const bTime =
              b.latestMessage
                ?.created_at ??
              b.created_at

            return (
              new Date(
                bTime
              ).getTime() -
              new Date(
                aTime
              ).getTime()
            )
          })
      })
    },
  })

  useEffect(() => {
    setConversations(
      initialConversations
    )
  }, [initialConversations])

  return {
    conversations,
  }
}