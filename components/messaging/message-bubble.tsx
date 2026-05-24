import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    created_at: string
    sender_id: string
    message_type?: string
    is_system?: boolean
  }

  isOwn: boolean
}

export function MessageBubble({
  message,
  isOwn,
}: MessageBubbleProps) {
  const formattedTime = new Date(
    message.created_at
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  /**
   * SYSTEM MESSAGE
   */
  if (
    message.is_system ||
    message.message_type === "system"
  ) {
    return (
      <div className="flex justify-center py-2">
        <div
          className="
            px-4
            py-2
            rounded-full
            bg-muted
            text-muted-foreground
            text-xs
            uppercase
            tracking-wide
          "
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full",
        isOwn
          ? "justify-end"
          : "justify-start"
      )}
    >
      <div
        className={cn(
          `
          max-w-[80%]
          rounded-2xl
          px-4
          py-3
          shadow-sm
          transition-all
          `,
          isOwn
            ? `
              bg-primary
              text-primary-foreground
              rounded-br-md
            `
            : `
              bg-muted
              text-foreground
              rounded-bl-md
            `
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        <div
          className={cn(
            "mt-2 text-[10px] opacity-70",
            isOwn
              ? "text-right"
              : "text-left"
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  )
}