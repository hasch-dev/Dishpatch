import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { InboxShell } from "@/components/messaging/inbox-shell"

export default async function MessagesLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // 1. Get the conversation IDs this user belongs to
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  const conversationIds = participation?.map(p => p.conversation_id) || []
  let initializedConversations: any[] = []

  if (conversationIds.length > 0) {
    // 2. Fetch conversations, including the crucial last_read_at timestamp
    const { data: chatsData } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_type,
        participants:conversation_participants(
          user_id,
          last_read_at, 
          profile:profiles(display_name)
        )
      `)
      .in('id', conversationIds)

    // 3. Fetch all messages
    const { data: messagesData } = await supabase
      .from('messages')
      .select('id, conversation_id, content, created_at, sender_id, message_type, proposal_status')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })

    if (chatsData) {
      // 4. Stitch everything together and calculate unread counts
      initializedConversations = chatsData.map((chat) => {
        const roomMessages = messagesData?.filter(m => m.conversation_id === chat.id) || []
        const latestMessage = roomMessages[0] || null
        
        // Determine Room Status Tag
        let roomTag = "negotiating"
        const latestProposal = roomMessages.find(m => m.message_type === "proposal")
        if (latestProposal) {
          if (latestProposal.proposal_status === "accepted") roomTag = "success"
          else if (latestProposal.proposal_status === "rejected" || latestProposal.proposal_status === "expired") roomTag = "cancelled"
        }

        // Calculate Unread Badge Logic
        const myParticipantRecord = chat.participants.find(p => p.user_id === user.id)
        
        // If last_read_at is null, default to 0 (meaning all messages are technically unread)
        const lastReadTime = myParticipantRecord?.last_read_at 
          ? new Date(myParticipantRecord.last_read_at).getTime() 
          : 0

        // Count messages from the other user that are newer than your last_read_at timestamp
        const calculatedUnreadCount = roomMessages.filter(m => 
          new Date(m.created_at).getTime() > lastReadTime
        ).length

        return {
          id: chat.id,
          conversation_type: chat.conversation_type,
          participants: chat.participants,
          latestMessage: latestMessage,
          roomTag: roomTag,
          unreadCount: calculatedUnreadCount 
        }
      })

      // 5. Sort newest to oldest
      initializedConversations.sort((a, b) => {
        const timeA = a.latestMessage ? new Date(a.latestMessage.created_at).getTime() : 0
        const timeB = b.latestMessage ? new Date(b.latestMessage.created_at).getTime() : 0
        return timeB - timeA
      })
    }
  }

  return (
    <InboxShell conversations={initializedConversations} currentUserId={user.id}>
      {children}
    </InboxShell>
  )
}