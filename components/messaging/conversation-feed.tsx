"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation" // <-- IMPORTED FOR SERVER REVALIDATION
import { SystemBubble } from "./feed/system-bubble"
import { TextBubble } from "./feed/text-bubble"
import { QuoteBubble } from "./feed/quote-bubble"

export function ConversationFeed({
  messages: initialMessages,
  currentUserId,
  bookingId,
  chefId,
  conversationId,
  budgetMin = 0,
  budgetMax = 0
}: {
  messages: any[]
  currentUserId: string
  bookingId?: string
  chefId?: string
  conversationId: string
  budgetMin?: number
  budgetMax?: number
}) {
  const [messages, setMessages] = useState<any[]>(initialMessages)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()
  const router = useRouter() // <-- ACCESSED ROUTER INSTANCE

  useEffect(() => setMessages(initialMessages), [initialMessages])
  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [messages])

  // Connect Optimistic UI Local Bus
  useEffect(() => {
    if (!conversationId) return

    const handleLocalOptimisticMessage = (e: Event) => {
      const customEvent = e as CustomEvent
      const tempMessage = customEvent.detail
      
      setMessages((prev) => {
        if (prev.some((m) => m.id === tempMessage.id)) return prev
        return [...prev, tempMessage]
      })
    }

    window.addEventListener(`optimistic_msg_${conversationId}`, handleLocalOptimisticMessage)
    return () => window.removeEventListener(`optimistic_msg_${conversationId}`, handleLocalOptimisticMessage)
  }, [conversationId])

  // Realtime Database Listener Loop
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new && payload.new.conversation_id === conversationId) {
            
            // --- LIVE SIDEBAR TAG SYNCHRONIZATION ---
            // If the incoming message event changes a proposal status, 
            // trigger a background server refresh to update layout room tags instantly!
            if (payload.new.message_type === "proposal") {
              router.refresh()
            }

            if (payload.eventType === "INSERT") {
              setMessages((prev) => {
                if (prev.some((m) => m.id === payload.new.id)) return prev
                
                const tempIndex = prev.findIndex((m) => 
                  m.id.toString().startsWith("temp-") &&
                  m.sender_id === payload.new.sender_id &&
                  m.content === payload.new.content
                )

                if (tempIndex !== -1) {
                  const verifiedState = [...prev]
                  verifiedState[tempIndex] = payload.new
                  return verifiedState
                }

                return [...prev, payload.new]
              })
            }
            if (payload.eventType === "UPDATE") {
              setMessages((prev) =>
                prev.map((m) => (m.id === payload.new.id ? payload.new : m))
              )
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase, router])

  const handleExpiration = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ proposal_status: "expired" })
      .eq("id", messageId)
      .eq("proposal_status", "pending") 
    
    router.refresh() // Refresh layout tags locally on expiration trip
  }

  const handleResolveQuote = async (messageId: string, currentMetadata: any, action: "accepted" | "rejected" | "counter", counterValue?: number) => {
    setProcessingId(messageId)
    
    try {
      if (action === "accepted") {
        const finalPrice = currentMetadata.price
        await supabase.from("messages").update({ proposal_status: "accepted" }).eq("id", messageId)
        
        if (bookingId) {
          await supabase.from("bookings").update({ 
            finalized_price: finalPrice, 
            status: "awaiting_payment" 
          }).eq("id", bookingId)
        }
        
        toast.success("Quote accepted. Deal finalized!")
        router.refresh() // Forces sidebar from 'negotiating' to 'success' instantly
      }
  
      if (action === "rejected") {
        await supabase.from("messages").update({ proposal_status: "rejected" }).eq("id", messageId)
        
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: null,
          content: "Proposal was formally refused. The floor is open for a new quote.",
          message_type: "system"
        })
        
        toast.error("Quote declined.")
        router.refresh() // Forces sidebar from 'negotiating' to 'cancelled' instantly
      }
  
      if (action === "counter" && counterValue) {
        await supabase.from("messages").update({ proposal_status: "revised" }).eq("id", messageId)
  
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: `Issued a formal counter-offer: ₱${counterValue.toLocaleString()}`,
          message_type: "proposal",
          proposal_status: "pending",
          metadata: { 
            price: counterValue, 
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() 
          }
        })
        router.refresh() // Confirms status stays pinned to 'negotiating'
      }
    } catch (error: any) {
      toast.error(`Action failed: ${error.message}`)
    }

    setProcessingId(null)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 no-scrollbar">
      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId
        const isSystem = msg.message_type === "system" || msg.sender_id === null
        
        if (isSystem) {
          return <SystemBubble key={msg.id} content={msg.content} />
        }

        if (msg.message_type === "proposal") {
          return (
            <QuoteBubble 
              key={msg.id}
              message={msg}
              isMe={isMe}
              isChefSession={currentUserId === chefId}
              bookingId={bookingId}
              budgetMin={budgetMin}
              budgetMax={budgetMax}
              processingId={processingId}
              onResolveQuote={handleResolveQuote}
              onExpire={handleExpiration}
            />
          )
        }

        return <TextBubble key={msg.id} content={msg.content} createdAt={msg.created_at} isMe={isMe} />
      })}
      <div ref={scrollRef} />
    </div>
  )
}