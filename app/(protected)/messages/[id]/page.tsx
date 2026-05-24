import { createClient } from "@/lib/supabase/server"

import { fetchConversation } from "@/lib/messaging/fetch-conversation"
import { markConversationRead } from "@/lib/messaging/mark-conversation-read"

import { ConversationFeed } from "@/components/messaging/conversation-feed"
import { ConversationInput } from "@/components/messaging/conversation-input"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const conversation = await fetchConversation(id)

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        Conversation not found
      </div>
    )
  }

  await markConversationRead(id)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ConversationFeed
        messages={conversation.messages ?? []}
        currentUserId={user.id}
      />

      <ConversationInput
        conversationId={conversation.id}
      />
    </div>
  )
}