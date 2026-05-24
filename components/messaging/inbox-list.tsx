"use client"

import { useInbox } from "@/hooks/use-inbox"

import { InboxItem } from "./inbox-item"

interface Props {
  initialConversations: any[]
  currentUserId: string
}

export function InboxList({
  initialConversations,
  currentUserId,
}: Props) {
  const { conversations } =
    useInbox({
      initialConversations,
    })

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map(
        (conversation: any) => (
          <InboxItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={
              currentUserId
            }
          />
        )
      )}
    </div>
  )
}