"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface Props {
  conversation: any
  currentUserId: string
}

export function InboxItem({
  conversation,
  currentUserId,
}: Props) {
  const pathname = usePathname()

  const isActive =
    pathname ===
    `/messages/${conversation.id}`

  const otherParticipant =
    conversation.participants?.find(
      (participant: any) =>
        participant.user_id !==
        currentUserId
    )

  const profile =
    otherParticipant?.profile

  return (
    <Link
      href={`/messages/${conversation.id}`}
    >
      <div
        className={`
          p-4 border-b transition-colors
          ${
            isActive
              ? "bg-muted"
              : "hover:bg-muted/50"
          }
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">
              {profile?.display_name ??
                "Unknown"}
            </p>

            <p className="text-sm text-muted-foreground truncate">
              {conversation.latestMessage
                ?.content ??
                "No messages yet"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {conversation.latestMessage && (
              <span className="text-xs text-muted-foreground">
                {new Date(
                  conversation.latestMessage.created_at
                ).toLocaleDateString()}
              </span>
            )}

            {conversation.unreadCount >
              0 && (
              <div className="min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1">
                {
                  conversation.unreadCount
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}