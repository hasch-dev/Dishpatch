import Link from "next/link"

import { UnreadBadge } from "./unread-badge"

export function ConversationItem({
  conversation,
  currentUserId,
}: any) {
  const otherParticipant = conversation.participants?.find(
    (participant: any) =>
      participant.profile?.id !== currentUserId
  )

  return (
    <Link href={`/messages/${conversation.id}`}>
      <div className="p-4 border-b hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {otherParticipant?.profile?.display_name ||
                "Conversation"}
            </div>

            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[220px]">
              {conversation.latestMessage?.content ||
                "No messages yet"}
            </div>
          </div>

          <UnreadBadge
            count={conversation.unreadCount}
          />
        </div>
      </div>
    </Link>
  )
}