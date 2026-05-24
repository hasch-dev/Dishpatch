import { createClient } from "@/lib/supabase/server"
import { fetchConversations } from "@/lib/messaging/fetch-conversations"
import { ConversationList } from "@/components/messaging/conversation-list"
import { EmptyState } from "@/components/messaging/empty-state" // Import the new component

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const conversations = await fetchConversations()

  // Handle empty state gracefully
  if (conversations.length === 0) {
    return (
      <div className="h-full w-full">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <ConversationList
        conversations={conversations}
        currentUserId={user.id}
      />
    </div>
  )
}