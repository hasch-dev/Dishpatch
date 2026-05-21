"use client"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { sendMessage } from "@/lib/messaging/send-message"

interface Props {
  conversationId: string
}

export function ConversationInput({
  conversationId,
}: Props) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!value.trim()) return

    try {
      setLoading(true)

      await sendMessage({
        conversationId,
        content: value,
      })

      setValue("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-border p-4 flex gap-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
      />

      <Button
        onClick={handleSend}
        disabled={loading || !value.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}