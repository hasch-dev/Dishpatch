"use client"

interface Props {
  message: any
  currentUserId: string
}

export function MessageItem({
  message,
  currentUserId,
}: Props) {
  const isMine = message.sender_id === currentUserId

  if (message.deleted_at) {
    return (
      <div className="text-xs italic opacity-50">
        Message deleted
      </div>
    )
  }

  return (
    <div
      className={`flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
          isMine
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p>{message.content}</p>

        <div className="mt-2 text-[10px] opacity-50">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}