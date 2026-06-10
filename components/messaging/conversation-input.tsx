"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Send, DollarSign, X, Lock, CreditCard, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ConversationInput({ 
  conversationId,
  bookingId,
  isChef = false,
  budgetMin = 0,
  budgetMax = 0
}: { 
  conversationId: string
  bookingId?: string
  isChef?: boolean
  budgetMin?: number
  budgetMax?: number
}) {
  const [content, setContent] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [isDealFinalized, setIsDealFinalized] = useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [quotePrice, setQuotePrice] = useState("")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!conversationId) return

    const checkLockStatus = async () => {
      const { data } = await supabase
        .from("messages")
        .select("proposal_status")
        .eq("conversation_id", conversationId)
        .eq("message_type", "proposal")
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        setIsLocked(data[0].proposal_status === "pending")
        setIsDealFinalized(data.some(m => m.proposal_status === "accepted"))
      }
    }

    checkLockStatus()

    const channel = supabase.channel(`input_lock_${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, checkLockStatus)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  // --- LIVE & CONTINUOUS SENDER LOGIC ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const messageText = content.trim()
    if (!messageText || isLocked) return

    // Wipe input text bar completely free for the next message entry string
    setContent("")
    setTimeout(() => textareaRef.current?.focus(), 10)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // --- INJECT INSTANT BROADCAST TO COMPANION SIDEBAR BUBBLES ---
      window.dispatchEvent(
        new CustomEvent(`optimistic_msg_${conversationId}`, {
          detail: {
            id: `temp-${Date.now()}`, // String identifier matches our state swap trigger
            conversation_id: conversationId,
            sender_id: user.id,
            content: messageText,
            message_type: "text",
            created_at: new Date().toISOString()
          }
        })
      )

      // Fire off standard async transaction safely in the background
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText,
        message_type: "text" 
      })

      if (error) {
        toast.error("Message failed to sync with cloud database.")
        setContent(messageText) // Restore text on severe backend crash
      }
    }
  }

  // --- KEYBOARD LISTENER (ENTER VS SHIFT+ENTER) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If user presses Enter WITHOUT holding Shift, execute message transmission
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Stop a regular newline character from printing
      handleSendMessage()
    }
    // If Shift + Enter is pressed, do nothing! The browser will naturally insert a newline break.
  }

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotePrice || isLocked || isDealFinalized) return

    const proposedPrice = parseFloat(quotePrice)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: `Proposed an event service quote: ₱${proposedPrice.toLocaleString()}`,
        message_type: "proposal", 
        proposal_status: "pending",
        metadata: { price: proposedPrice, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() }
      })
    }
    setIsQuoteOpen(false)
    setQuotePrice("")
  }

  return (
    <div className="bg-background flex flex-col relative z-10">
      
      {/* Deal Finalized Banner */}
      {isDealFinalized && (
        <div className="bg-green-500/10 border-t border-b border-green-500/20 px-4 py-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Escrow Secured</span>
            <span className="text-[10px] text-green-700/70 hidden sm:inline ml-1 italic">
              — Logistics lines active.
            </span>
          </div>
          {!isChef && (
            <button 
              onClick={() => router.push(`/bookings/${bookingId}/payment`)}
              className="bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CreditCard size={12} /> Checkout
            </button>
          )}
        </div>
      )}

      {/* Quote Drawer */}
      {isQuoteOpen && !isLocked && !isDealFinalized && (
        <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 z-50 animate-in slide-in-from-bottom-2 max-w-sm mx-auto">
          <div className="bg-card border border-border shadow-2xl p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <DollarSign size={12} /> Draft Proposal
              </h4>
              <button onClick={() => setIsQuoteOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSendQuote} className="space-y-3">
              <input 
                type="number" required value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)}
                className="w-full bg-muted border border-border px-3 py-2 text-xs font-mono rounded-lg focus:outline-none focus:border-primary"
                placeholder="Enter pricing (PHP)..."
              />
              <button type="submit" disabled={!quotePrice} className="w-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-wider py-2.5 rounded-lg">
                Broadcast Quote
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Text Input Bar Area */}
      <div className={`p-3 transition-colors ${isLocked ? "bg-muted/30" : "bg-background"}`}>
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative flex items-center">
            
            {/* UPGRADED: Textarea element to support multi-line data architecture & zero freezing */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocked}
              placeholder={
                isLocked ? "Awaiting contract verification..." : 
                isDealFinalized ? "Coordinate logistics, arrival setups, location notes..." : 
                "Transmit message... (Shift + Enter for new line)"
              }
              className={`w-full bg-muted/50 border border-border pl-4 pr-10 py-3 text-xs rounded-xl focus:outline-none focus:border-primary transition-all resize-none min-h-[42px] max-h-32 field-sizing-content leading-normal ${
                isLocked ? "cursor-not-allowed italic text-muted-foreground/50" : ""
              }`}
            />
            {isLocked && <Lock size={14} className="absolute right-4 bottom-3 text-muted-foreground/40" />}
          </div>
          
          {isChef && !isLocked && !isDealFinalized && (
            <button
              type="button" onClick={() => setIsQuoteOpen(!isQuoteOpen)}
              className={`px-4 h-[42px] border rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                isQuoteOpen ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <DollarSign size={14} /> <span className="hidden sm:inline text-[9px]">Quote</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLocked || !content.trim()} 
            className="bg-primary text-primary-foreground px-4 h-[42px] rounded-xl hover:bg-primary/90 disabled:opacity-30 flex items-center justify-center transition-all shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}