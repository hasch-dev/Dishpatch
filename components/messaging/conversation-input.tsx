"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Send, DollarSign, X } from "lucide-react"

export function ConversationInput({ 
  conversationId, 
  isChef = false // We will pass this from the main page next!
}: { 
  conversationId: string
  isChef?: boolean
}) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Quote Modal State
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteNote, setQuoteNote] = useState("")

  const supabase = createClient()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: "text" // Standard text message
      })
    }
    
    setContent("")
    setIsLoading(false)
  }

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quotePrice) return

    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: "Has sent a new quote proposal.",
        message_type: "quote", // Flags the UI to render a card instead of text
        metadata: {
          price: parseFloat(quotePrice),
          note: quoteNote.trim(),
          status: "pending" // Can be updated to 'accepted' or 'declined' by the client later
        }
      })
    }
    
    setIsQuoteOpen(false)
    setQuotePrice("")
    setQuoteNote("")
    setIsLoading(false)
  }

  return (
    <div className="p-4 bg-background border-t border-foreground/5 relative z-10">
      
      {/* --- QUOTE DRAFTING MODAL --- */}
      {isQuoteOpen && (
        <div className="absolute bottom-[calc(100%+10px)] left-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="bg-card border border-primary/20 shadow-2xl p-5 rounded-none ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-5 border-b border-foreground/5 pb-3">
              <h3 className="font-serif italic font-bold text-sm flex items-center gap-2 text-foreground">
                <DollarSign size={16} className="text-primary" />
                Draft Final Quote
              </h3>
              <button 
                onClick={() => setIsQuoteOpen(false)} 
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground block mb-2">
                  Final Total Price ($)
                </label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. 1500" 
                  className="w-full bg-foreground/[0.02] border border-foreground/10 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground block mb-2">
                  Notes / Adjustments
                </label>
                <input 
                  type="text" 
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  placeholder="e.g. Added $100 for premium ingredient upgrade" 
                  className="w-full bg-foreground/[0.02] border border-foreground/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] py-4 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isLoading ? "Transmitting..." : "Issue Quote to Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- STANDARD CHAT INPUT BAR --- */}
      <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Transmit message..."
            disabled={isLoading}
            className="w-full bg-foreground/[0.02] border border-foreground/10 px-5 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        {/* Chef-only Quote Trigger Button */}
        {isChef && (
          <button
            type="button"
            onClick={() => setIsQuoteOpen(!isQuoteOpen)}
            className={`px-5 py-3.5 border transition-all flex items-center gap-2 ${
              isQuoteOpen 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-foreground/[0.02] border-foreground/10 hover:border-primary/50 text-foreground"
            }`}
            title="Create Quote"
          >
            <DollarSign size={16} />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em]">Quote</span>
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="bg-primary text-primary-foreground px-6 py-3.5 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}