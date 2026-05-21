"use client"

import { useEffect, useRef } from "react"
import { MessageItem } from "./message-item"

interface Props {
  messages: any[]
  currentUserId: string
}

export function ConversationFeed({
  messages,
  currentUserId,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}