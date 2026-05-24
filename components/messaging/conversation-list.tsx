import Link from "next/link"

interface Props {
  conversations: any[]
  currentUserId: string
}

export function ConversationList({
  conversations,
  currentUserId,
}: Props) {
  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const otherParticipant =
          conversation.participants?.find(
            (p: any) => p.user_id !== currentUserId
          )

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="border-b border-border p-4 hover:bg-muted/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {otherParticipant?.profile?.display_name?.[0] ?? "?"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {conversation.subject ??
                    otherParticipant?.profile?.display_name ??
                    "Conversation"}
                </p>

                <p className="text-xs text-muted-foreground truncate">
                  {conversation.messages?.[0]?.content ??
                    "No messages yet"}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}