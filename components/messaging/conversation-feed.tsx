"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, Check, X, ShieldCheck } from "lucide-react"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  message_type: string
  metadata?: {
    price: number
    note?: string
    status: "pending" | "accepted" | "declined"
  }
}

export function ConversationFeed({
  messages: initialMessages,
  currentUserId,
}: {
  messages: Message[]
  currentUserId: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Sync prop changes to local state
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Automatic smooth scroll to the newest message payload
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Listen for real-time quote status changes on this feed
  useEffect(() => {
    if (messages.length === 0) return

    const channel = supabase
      .channel(`feed_updates_${messages[0].conversation_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messages])

  // Client-Side Action Handler for Quote Acceptance/Decline
  const handleQuoteResolution = async (messageId: string, currentMetadata: any, resolution: "accepted" | "declined") => {
    setProcessingId(messageId)

    const updatedMetadata = {
      ...currentMetadata,
      status: resolution,
    }

    // 1. Update the message card metadata state in Supabase
    const { error: msgError } = await supabase
      .from("messages")
      .update({ metadata: updatedMetadata })
      .eq("id", messageId)

    if (msgError) {
      console.error("Failed to resolve quote status:", msgError)
      setProcessingId(null)
      return
    }

    // 2. OPTIONAL ADVANCED STEP: If accepted, automatically lock the price to the deals/bookings engine
    if (resolution === "accepted") {
      // Find the conversation row to extract the booking_id mapping
      const { data: conv } = await supabase
        .from("conversations")
        .select("booking_id")
        .eq("id", messages[0].conversation_id)
        .single()

      if (conv?.booking_id) {
        // Update your bookings row to advance to payment collection phase
        await supabase
          .from("bookings")
          .update({
            finalized_price: currentMetadata.price,
            status: "awaiting_payment"
          })
          .eq("id", conv.booking_id)
      }
    }

    // Optimistically update local UI array instantly
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, metadata: updatedMetadata } : m))
    )
    setProcessingId(null)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-muted/5 no-scrollbar">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId
        const isSystem = msg.sender_id === "system"
        const isQuote = msg.message_type === "quote"

        // Render standard system operational labels cleanly centered
        if (isSystem) {
          return (
            <div key={msg.id} className="flex justify-center my-4">
              <div className="bg-foreground/[0.02] border border-foreground/5 px-4 py-1.5 rounded-none text-[10px] font-mono tracking-wider uppercase text-muted-foreground italic">
                {msg.content}
              </div>
            </div>
          )
        }

        // --- RENDER INTERACTIVE ESCROW QUOTE CARDS ---
        if (isQuote && msg.metadata) {
          const { price, note, status } = msg.metadata
          // Since only chefs can issue quotes, the sender is always the Chef. 
          // If 'isMe' is true, the viewer is the Chef. If false, the viewer is the Client.
          const isClientViewer = !isMe 

          return (
            <div key={msg.id} className="flex justify-center my-6 w-full max-w-2xl mx-auto">
              <div className="w-full bg-card border border-foreground/10 shadow-md divide-y divide-foreground/5 animate-in zoom-in-95 duration-200">
                
                {/* Card Top Branding Header */}
                <div className="p-4 bg-foreground/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-muted-foreground">
                    <DollarSign size={14} className="text-primary" />
                    Official Premium Quote Package
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 font-bold ${
                    status === "accepted" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                    status === "declined" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    "bg-primary/10 text-primary border border-primary/20 animate-pulse"
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Main Pricing Center Payload */}
                <div className="p-6 space-y-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-muted-foreground block mb-1">
                      Proposed Event Total
                    </span>
                    <h2 className="text-4xl font-serif italic font-black text-foreground">
                      ${price.toLocaleString()} <span className="text-xs font-sans font-normal normal-case text-muted-foreground">USD</span>
                    </h2>
                  </div>
                  
                  {note && (
                    <div className="bg-foreground/[0.02] border border-foreground/5 p-4 text-xs italic text-muted-foreground leading-relaxed font-mono">
                      "{note}"
                    </div>
                  )}
                </div>

                {/* Card Action Controls Footer */}
                {status === "pending" && (
                  <div className="p-2 bg-foreground/[0.01] flex gap-2">
                    {isClientViewer ? (
                      <>
                        <button
                          disabled={processingId !== null}
                          onClick={() => handleQuoteResolution(msg.id, msg.metadata, "accepted")}
                          className="flex-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] py-3 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          <Check size={12} /> Accept & Unlock Escrow
                        </button>
                        <button
                          disabled={processingId !== null}
                          onClick={() => handleQuoteResolution(msg.id, msg.metadata, "declined")}
                          className="px-4 border border-foreground/10 hover:border-red-500/30 hover:bg-red-500/5 text-[10px] font-bold uppercase tracking-[0.2em] py-3 transition-all text-muted-foreground hover:text-red-500 disabled:opacity-40"
                        >
                          <X size={12} /> Decline
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2 text-[10px] font-mono text-muted-foreground tracking-wider uppercase italic opacity-60">
                        Awaiting review response from client...
                      </div>
                    )}
                  </div>
                )}

                {/* Post-Resolution State Banner */}
                {status === "accepted" && (
                  <div className="p-3 bg-green-500/[0.02] text-center text-[10px] font-mono text-green-600 uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
                    <ShieldCheck size={14} /> Sequence locked. Order forwarded to secure checkout link generation layer.
                  </div>
                )}
              </div>
            </div>
          )
        }

        {/* --- STANDARD REGULAR TEXT BUBBLES --- */}
        return (
          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] md:max-w-[65%] px-5 py-3.5 shadow-sm rounded-none border ${
              isMe 
                ? "bg-foreground text-background border-foreground rounded-tr-none" 
                : "bg-card text-foreground border-foreground/5 rounded-tl-none"
            }`}>
              <p className="text-sm font-light leading-relaxed whitespace-pre-wrap select-text">
                {msg.content}
              </p>
              <span className={`text-[8px] font-mono tracking-widest mt-2 block opacity-50 uppercase ${
                isMe ? "text-right" : "text-left"
              }`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        )
      })}
      
      {/* Invisible anchor tag node forcing view container boundaries down */}
      <div ref={scrollRef} />
    </div>
  )
}