import { createClient } from "@/lib/supabase/server"
import { fetchConversation } from "@/lib/messaging/fetch-conversation"
import { ConversationFeed } from "@/components/messaging/conversation-feed"
import { ConversationInput } from "@/components/messaging/conversation-input"
import { ShieldCheck, User as UserIcon, Wallet } from "lucide-react"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch the safe UUID conversation (with Booking data attached)
  const conversation = await fetchConversation(id)

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-background text-muted-foreground border-l border-foreground/5 space-y-4">
        <ShieldCheck className="h-8 w-8 opacity-20" />
        <p className="italic text-sm font-serif">Conversation not found or access denied.</p>
      </div>
    )
  }

  // 1. Determine Chat Context & Roles
  const isSupport = conversation.conversation_type === "support"
  
  // NEW: Identify if the logged-in user is the Chef for this specific booking
  const isChef = !isSupport && conversation.chef_id === user.id

  // 2. Determine Top Header Identity
  let chatTitle = "Unknown User"
  let chatSubtitle = "Active Chat"
  let bookingBudget = null

  if (isSupport) {
    if (conversation.client_id === user.id) {
      // Client looking at their support ticket
      chatTitle = "HQ Concierge"
      chatSubtitle = "Official Support Line"
    } else {
      // Admin looking at a client's support ticket
      const clientParticipant = conversation.participants?.find(
        (p: any) => p.role === "client" || p.user_id === conversation.client_id
      )
      chatTitle = clientParticipant?.profile?.display_name || "Client Ticket"
      chatSubtitle = "Support Operations Queue"
    }
  } else {
    // Standard Chef/Client Booking Chat
    const partner = conversation.participants?.find(
      (p: any) => p.user_id !== user.id
    )
    chatTitle = partner?.profile?.display_name || "Active Booking"
    chatSubtitle = "Direct Message • Escrow Secured"
    
    // Grab the initial budget set by the client from the linked booking table
    // (Adjust 'budget' to whatever your column name is, e.g., 'price' or 'target_budget')
    bookingBudget = conversation.booking?.budget || conversation.booking?.price || "TBD"
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-background border-l border-foreground/5">
      
      {/* Dynamic Chat Header Navbar */}
      <div className="h-20 border-b border-foreground/5 bg-card/30 flex items-center px-8 shrink-0 justify-between">
        
        {/* Left Side: Identity */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            {isSupport ? <ShieldCheck className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-wider text-foreground">
              {chatTitle}
            </h2>
            <p className="text-[11px] text-muted-foreground italic opacity-80">
              {chatSubtitle}
            </p>
          </div>
        </div>
        
        {/* Right Side: Operational Metadata */}
        <div className="flex items-center gap-4">
          {/* If it's a booking, show the initial budget securely in the header */}
          {!isSupport && bookingBudget && (
            <div className="flex items-center gap-2 bg-foreground/[0.03] border border-foreground/10 px-4 py-2">
              <Wallet size={12} className="text-muted-foreground" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground">
                Client Budget: <span className="text-primary">${bookingBudget}</span>
              </span>
            </div>
          )}

          {/* If it's support, show the ticket status */}
          {isSupport && (
             <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary border border-primary/20 bg-primary/5 px-3 py-1.5">
              Status: {conversation.status}
            </span>
          )}
        </div>
      </div>

      {/* Realtime Message Feed */}
      <ConversationFeed
        messages={conversation.messages ?? []}
        currentUserId={user.id}
      />

      {/* Upgraded Realtime Input Box (Now receives the isChef boolean!) */}
      <ConversationInput
        conversationId={conversation.id}
        isChef={isChef}
      />
    </div>
  )
}