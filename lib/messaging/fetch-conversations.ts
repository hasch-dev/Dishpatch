import { createClient } from "@/lib/supabase/server"

export async function fetchConversations() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Top-Down Query: Safely start from conversations now that the RLS loop is fixed!
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      last_message_at,
      conversation_type,
      booking_id,

      participants:conversation_participants!inner(
        role,
        user_id,
        profile:profiles!conversation_participants_user_id_fkey(
          id,
          display_name,
          user_type,
          chef_image_url
        )
      ),

      latestMessage:messages!conversations_last_message_id_fkey(
        id,
        content,
        created_at,
        sender_id,
        conversation_id,
        message_type,
        is_system
      )
    `)
    .eq("participants.user_id", user.id)
    .order("last_message_at", { ascending: false })

  if (error) {
    console.error("FETCH CONVERSATIONS ERROR:", JSON.stringify(error, null, 2))
    return []
  }

  // 🚨 DEBUG LOG: Check your terminal (where you run npm run dev) to see if data is arriving
  console.log(`Fetched ${conversations?.length || 0} conversations for user:`, user.id)

  if (!conversations || conversations.length === 0) return []

  // 2. Extract IDs for a single batch request
  const conversationIds = conversations.map((c: any) => c.id)

  // 3. Fetch all unread counts at once
  const { data: unreadCounts, error: unreadError } = await supabase.rpc(
    "get_unread_count",
    {
      p_user_id: user.id,
      p_conversation_ids: conversationIds,
    }
  )

  if (unreadError) {
    console.error("FETCH UNREAD COUNTS ERROR:", unreadError)
  }

  const unreadMap = (unreadCounts || []).reduce((acc: any, item: any) => {
    acc[item.conversation_id] = item.unread_count
    return acc
  }, {})

  // 4. Merge data and return in the exact format your UI expects
  return conversations.map((conv: any) => ({
    ...conv,
    unreadCount: unreadMap[conv.id] || 0,
    latestMessage: Array.isArray(conv.latestMessage)
      ? conv.latestMessage[0]
      : conv.latestMessage,
  }))
}