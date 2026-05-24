import { ReactNode } from "react"

import { createClient } from "@/lib/supabase/server"

import { fetchConversations } from "@/lib/messaging/fetch-conversations"

import { InboxShell } from "@/components/messaging/inbox-shell"

export default async function MessagesLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const conversations =
    await fetchConversations()

  return (
    <InboxShell
      conversations={conversations}
      currentUserId={user.id}
    >
      {children}
    </InboxShell>
  )
}