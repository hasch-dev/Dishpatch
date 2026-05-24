import { createClient } from "@/lib/supabase/server"

export async function fetchConversation(
  id?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return id ? null : []
  }

  /*
    SINGLE CONVERSATION
  */
  if (id) {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          *,
          profile:profiles(*)
        ),
        messages(
          *
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      return null
    }

    return data
  }

  /*
    INBOX LIST
  */
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      last_read_at,
      conversation:conversations(
        *,
        participants:conversation_participants(
          *,
          profile:profiles(*)
        ),
        messages(
          id,
          content,
          created_at,
          sender_id
        )
      )
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error(error)
    return []
  }

  const conversations =
    data
      ?.map((item: any) => {
        const conversation =
          item.conversation

        if (!conversation) return null

        const sortedMessages =
          [...(conversation.messages ?? [])]
            .sort(
              (a, b) =>
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
            )

        const latestMessage =
          sortedMessages[0]

        const unreadCount =
          sortedMessages.filter(
            (message: any) =>
              message.sender_id !== user.id &&
              (!item.last_read_at ||
                new Date(
                  message.created_at
                ) >
                  new Date(
                    item.last_read_at
                  ))
          ).length

        return {
          ...conversation,
          latestMessage,
          unreadCount,
        }
      })
      .filter(Boolean) ?? []

  return conversations.sort(
    (a: any, b: any) => {
      const aTime =
        a.latestMessage?.created_at ??
        a.created_at

      const bTime =
        b.latestMessage?.created_at ??
        b.created_at

      return (
        new Date(bTime).getTime() -
        new Date(aTime).getTime()
      )
    }
  )
}