"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, MapPin, ShieldCheck, LifeBuoy, Calendar, Clock, Utensils } from "lucide-react"

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [chatInfo, setChatInfo] = React.useState<any>(null)
  const [activeBooking, setActiveBooking] = React.useState<any>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  const supabase = createClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const isSupportChat = params.id === "support"

  React.useEffect(() => {
    const setupChat = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      if (isSupportChat) {
        setChatInfo({ is_support: true, display_name: "Concierge" })
        setMessages([{
          id: 'welcome',
          content: 'Dishpatch Concierge active. How can we assist with your booking?',
          sender_id: 'system',
          created_at: new Date().toISOString()
        }])
        setLoading(false)
        return; 
      }

      try {
        // 1. Fetch Conversation Info
        const { data: conv } = await supabase
          .from('conversations')
          .select(`*, chef:chef_id(*), client:client_id(*)`)
          .eq('id', params.id).single()
        
        if (conv) {
          setChatInfo(conv)
          // 2. Fetch the latest active booking between these two users
          const { data: booking } = await supabase
            .from('bookings')
            .select('*')
            .eq('chef_id', conv.chef_id)
            .eq('client_id', conv.client_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
          if (booking) setActiveBooking(booking)
        }

        // 3. Fetch Message History
        const { data: msgs } = await supabase.from('messages')
          .select('*').eq('conversation_id', params.id).order('created_at', { ascending: true })
        
        if (msgs) setMessages(msgs)
      } catch (e) {
        console.error("Fetch failed", e)
      } finally {
        setLoading(false)
      }
    }

    setupChat()
    
    if (!isSupportChat) {
      const channel = supabase.channel(`chat:${params.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${params.id}` }, 
        (payload) => setMessages((prev) => [...prev, payload.new]))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [params.id, isSupportChat])

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    if (isSupportChat) {
      setMessages(prev => [...prev, { id: Date.now(), content: newMessage, sender_id: userId, created_at: new Date().toISOString() }])
      setNewMessage("")
      return;
    }

    const { error } = await supabase.from('messages').insert({ conversation_id: params.id, content: newMessage, sender_id: userId })
    if (!error) setNewMessage("")
  }

  if (loading) return <div className="flex-1 flex items-center justify-center font-serif italic text-muted-foreground animate-pulse">Entering the Suite...</div>

  const isChef = chatInfo?.chef_id === userId
  const partner = isSupportChat ? chatInfo : (isChef ? chatInfo?.client : chatInfo?.chef)
  
  // Parse booking notes safely
  let parsedNotes: any = {}
  if (activeBooking?.notes) {
    try { parsedNotes = JSON.parse(activeBooking.notes) } catch {}
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card/10 flex justify-between items-center">
          <div>
            <h2 className="font-serif italic font-bold text-xl">{partner?.display_name}</h2>
            <div className="flex items-center gap-1 text-[9px] text-primary uppercase tracking-[0.2em] font-bold">
              {isSupportChat ? <LifeBuoy className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {isSupportChat ? 'Official Concierge' : 'Verified Partner'}
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                msg.sender_id === userId ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'
              }`}>
                <p className="text-sm font-light leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-6 bg-card border-t border-border flex gap-4">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="rounded-full bg-background italic px-6 h-12" />
          <Button type="submit" size="icon" className="rounded-full h-12 w-12 shadow-xl"><Send className="h-4 w-4" /></Button>
        </form>
      </div>

      {/* --- NEW: COLUMN 3: Booking & Profile Details (Right) --- */}
      <aside className="w-80 bg-card/30 p-8 hidden 2xl:flex flex-col gap-8 overflow-y-auto">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif italic text-3xl mx-auto mb-4">
            {partner?.display_name?.[0]}
          </div>
          <h3 className="font-bold text-lg uppercase tracking-tighter text-foreground">{partner?.display_name}</h3>
          <p className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold mt-1">
            {isSupportChat ? 'Concierge' : partner?.user_type}
          </p>
        </div>

        {!isSupportChat && activeBooking && (
          <div className="space-y-4 border border-border bg-background p-5 rounded-2xl shadow-sm">
            <h4 className="text-[10px] font-bold uppercase text-primary tracking-[0.2em] flex items-center gap-2 border-b border-border pb-2">
              <Utensils className="h-3 w-3" /> Event Overview
            </h4>
            
            <div>
              <p className="font-serif italic font-bold text-lg leading-tight">{activeBooking.title}</p>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1 inline-block bg-muted px-2 py-0.5 rounded">
                Status: {activeBooking.status}
              </span>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span className="font-medium">{activeBooking.event_date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary/60" />
                <span className="font-medium">{activeBooking.event_time || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary/60" />
                <span className="font-medium truncate">{parsedNotes.location || 'Location TBD'}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-primary/60" />
                <span className="font-medium">
                  {parsedNotes.guestRange ? `${parsedNotes.guestRange.min}-${parsedNotes.guestRange.max} Guests` : 'Guest Count TBD'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
           <p className="text-[9px] text-muted-foreground text-center italic">
            Consultation and event details are securely encrypted.
          </p>
        </div>
      </aside>
    </div>
  )
}