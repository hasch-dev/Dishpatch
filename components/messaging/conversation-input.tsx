"use client"

import { useState, useTransition } from "react"

import { sendMessage } from "@/lib/messaging/send-message"

export function ConversationInput({
  conversationId,
}: {
  conversationId: string
}) {
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const handleSend = async () => {
    if (!message.trim()) return

    const content = message

    setMessage("")

    startTransition(async () => {
      await sendMessage({
        conversationId,
        content,
      })
    })
  }

  return (
    <div className="border-t p-4 flex gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-md px-4 py-3"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleSend()
          }
        }}
      />

      <button
        onClick={handleSend}
        disabled={pending}
        className="px-4 py-2 rounded-md bg-black text-white"
      >
        Send
      </button>
    </div>
  )
}