import { fetchConversations } from "@/lib/messaging/fetch-conversations"
import { createClient } from "@/lib/supabase/server"
import { ConversationList } from "@/components/messaging/conversation-list"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const conversations = await fetchConversations()

  return (
    <ConversationList
      conversations={conversations}
      currentUserId={user.id}
    />
  )
}