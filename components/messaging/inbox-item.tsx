"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react"

interface Props {
  conversation: any
  currentUserId: string
}

function formatMessageTime(dateString?: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()

  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isYesterday) return "Yesterday"
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function InboxItem({ conversation, currentUserId }: Props) {
  const pathname = usePathname()
  const isActive = pathname === `/messages/${conversation.id}`

  const otherParticipant = conversation.participants?.find(
    (participant: any) => participant.user_id !== currentUserId
  )
  const profile = otherParticipant?.profile
  const partnerName = profile?.display_name || "Unknown User"

  const lastMsg = conversation.latestMessage
  const isMe = lastMsg?.sender_id === currentUserId
  
  let snippetText = "No messages yet"
  if (lastMsg) {
    if (lastMsg.message_type === "proposal") {
      snippetText = isMe ? "You drafted a new contract." : "Transmitted a quote proposal."
    } else {
      snippetText = isMe ? `You: ${lastMsg.content}` : lastMsg.content
    }
  }

  const unreadCount = conversation.unreadCount || 0
  const hasUnread = unreadCount > 0

  // Fallback map for rendering the UI styling of the tag
  const roomTag = conversation.roomTag || "negotiating"
  const tagConfig = {
    success: { label: "Success", color: "text-green-600 bg-green-500/10 border-green-500/20", icon: <CheckCircle2 size={8} /> },
    cancelled: { label: "Cancelled", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: <XCircle size={8} /> },
    negotiating: { label: "Negotiating", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: <MessageSquare size={8} /> }
  }
  const tag = tagConfig[roomTag as keyof typeof tagConfig] || tagConfig.negotiating

  return (
    <Link href={`/messages/${conversation.id}`}>
      <div className={`p-3 border-b border-border/40 transition-colors group ${
        isActive ? "bg-muted" : "hover:bg-muted/50"
      }`}>
        <div className="flex items-center gap-3">
          
          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-serif italic text-sm border transition-colors shrink-0 ${
            hasUnread ? "bg-primary text-primary-foreground border-primary" : "bg-primary/10 text-primary border-primary/5"
          }`}>
            {partnerName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-1 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <p className={`text-xs truncate uppercase tracking-tighter transition-all ${
                  hasUnread ? "font-black text-foreground" : "font-bold text-foreground/90"
                }`}>
                  {partnerName}
                </p>
                {/* INJECTED PREMIUM TAG PILL */}
                <span className={`flex items-center gap-1 px-1.5 py-0.5 border text-[7px] font-mono font-bold tracking-widest uppercase rounded-md shrink-0 ${tag.color}`}>
                  {tag.icon} {tag.label}
                </span>
              </div>
              
              {lastMsg && (
                <span className={`text-[9px] font-mono shrink-0 transition-colors ${
                  hasUnread ? "text-primary font-bold" : "text-muted-foreground"
                }`}>
                  {formatMessageTime(lastMsg.created_at)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className={`text-[10px] truncate ${
                hasUnread ? "font-semibold text-foreground italic" : "text-muted-foreground font-light opacity-80 group-hover:opacity-100 transition-opacity"
              }`}>
                {snippetText}
              </p>

              {hasUnread && (
                <div className="h-4 min-w-[16px] px-1 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in duration-200">
                  <span className="text-[9px] font-black text-primary-foreground tabular-nums">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  )
}