"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Send, User, MapPin, ShieldCheck, LifeBuoy, 
  Calendar, Clock, Utensils, AlertTriangle, FileText, Lock, Download
} from "lucide-react"
import { ModifyTermsDialog } from "@/components/modify-terms-dialog" 
import { AcceptQuoteDialog } from "@/components/accept-quote-dialog"

// Stable client instance outside the component
const supabase = createClient()

export default function ChatRoom({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params immediately
  const { id: chatId } = React.use(params)
  const isSupportChat = chatId === "support"
  
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [chatInfo, setChatInfo] = React.useState<any>(null)
  const [activeBooking, setActiveBooking] = React.useState<any>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // 2. Combined & Stabilized Data Fetching
  React.useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      setLoading(true)
      
      // Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return
      if (user) setUserId(user.id)

      if (isSupportChat) {
        setChatInfo({ is_support: true, display_name: "Concierge" })
        setMessages([{
          id: 'welcome',
          content: 'Dishpatch Concierge active. How can we assist with your deployment?',
          sender_id: 'system',
          is_system: true,
          created_at: new Date().toISOString()
        }])
        setLoading(false)
        return
      }

      try {
        // Fetch Conversation and Participants
        const { data: conv } = await supabase
          .from('conversations')
          .select(`*, chef:chef_id(*), client:client_id(*)`)
          .eq('id', chatId)
          .single()
        
        if (conv && isMounted) {
          setChatInfo(conv)
          
          // Fetch associated booking
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

        // Fetch Message History
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: true })
        
        if (msgs && isMounted) setMessages(msgs)
      } catch (e) {
        console.error("Dishpatch Sync Error:", e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initChat()

    // 3. Setup Realtime (Nested to keep dependencies clean)
    if (!isSupportChat) {
      const channel = supabase.channel(`chat_room_${chatId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${chatId}` 
        }, (payload) => {
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings' 
        }, (payload) => {
          setActiveBooking(payload.new)
        })
        .subscribe()

      return () => {
        isMounted = false
        supabase.removeChannel(channel)
      }
    }

    return () => { isMounted = false }
  }, [chatId, isSupportChat]) // Array size will now remain constant at 2

  // Auto-scroll logic
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const messageText = newMessage
    setNewMessage("")

    if (isSupportChat) {
      setMessages(prev => [...prev, { 
        id: `support_${Date.now()}`, 
        content: messageText, 
        sender_id: userId, 
        created_at: new Date().toISOString() 
      }])
      return
    }

    const tempId = `temp_${Date.now()}`
    setMessages(prev => [...prev, { 
      id: tempId, 
      content: messageText, 
      sender_id: userId, 
      created_at: new Date().toISOString() 
    }])

    const { error, data } = await supabase
      .from('messages')
      .insert({ conversation_id: chatId, content: messageText, sender_id: userId })
      .select().single()

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(messageText) 
    } else {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m))
    }
  }

  const downloadTranscript = () => {
    const transcript = messages.map(m => 
      `[${new Date(m.created_at).toLocaleString()}] ${m.is_system ? 'SYSTEM' : (m.sender_id === userId ? 'ME' : 'PARTNER')}: ${m.content}`
    ).join('\n')
    
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Dishpatch_Transcript_${chatId}.txt`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-serif italic text-muted-foreground text-sm tracking-widest uppercase">Securing Connection...</span>
      </div>
    )
  }

  const isChef = chatInfo?.chef_id === userId
  const partner = isSupportChat ? chatInfo : (isChef ? chatInfo?.client : chatInfo?.chef)
  const isBookingLocked = activeBooking?.status === 'confirmed'
  
  let parsedNotes: any = {}
  if (activeBooking?.notes) {
    try { parsedNotes = typeof activeBooking.notes === 'string' ? JSON.parse(activeBooking.notes) : activeBooking.notes } catch {}
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-6 border-b border-border bg-background flex justify-between items-center z-10 shadow-sm">
          <div>
            <h2 className="font-serif italic font-bold text-xl">{partner?.display_name || "System User"}</h2>
            <div className="flex items-center gap-1 text-[9px] text-primary uppercase tracking-[0.2em] font-bold mt-1">
              {isSupportChat ? <LifeBuoy className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {isSupportChat ? 'Official Concierge' : 'Verified Profile'}
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-muted/5">
          {messages.map((msg) => {
            if (msg.is_system) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-muted/40 border border-border/50 px-6 py-2 flex items-center gap-4">
                    <div className="h-[1px] w-6 bg-primary/20" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/80 italic text-center">
                      {msg.content}
                    </span>
                    <div className="h-[1px] w-6 bg-primary/20" />
                  </div>
                </div>
              )
            }

            const isMe = msg.sender_id === userId || (isSupportChat && msg.sender_id !== 'system')
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-xl shadow-sm ${
                  isMe ? 'bg-foreground text-background rounded-tr-sm' : 'bg-background border border-border rounded-tl-sm'
                }`}>
                  <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                  <span className={`text-[8px] uppercase tracking-widest mt-2 block opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 bg-background border-t border-border flex gap-4 items-center">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Transmit secure message..." 
            className="flex-1 rounded-none border-border bg-muted/20 px-6 h-14 font-light focus-visible:ring-1 focus-visible:ring-primary" 
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-none h-14 w-14">
            <Send className="h-5 w-5 ml-1" />
          </Button>
        </form>
      </div>

      {/* Sidebar */}
      <aside className="w-96 bg-card/10 p-8 hidden xl:flex flex-col gap-8 overflow-y-auto shrink-0">
        <div className="text-center pb-8 border-b border-border/50">
          <div className="h-24 w-24 rounded-full bg-background border border-border flex items-center justify-center text-foreground font-serif italic text-4xl mx-auto mb-4">
            {partner?.display_name?.[0] || "S"}
          </div>
          <h3 className="font-bold text-xl uppercase tracking-tighter">{partner?.display_name || "Unknown"}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold mt-2">
            {isSupportChat ? 'System Operations' : (isChef ? 'Client Profile' : 'Artisan Profile')}
          </p>
        </div>

        {!isSupportChat && activeBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase text-primary tracking-[0.3em]">Briefing</h4>
              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm ${isBookingLocked ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                {activeBooking.status}
              </span>
            </div>
            
            <div className="bg-background border border-border p-6 rounded-sm space-y-6">
              <p className="font-serif italic font-bold text-xl leading-tight">{activeBooking.title || "Experience"}</p>
              <div className="grid grid-cols-1 gap-4 text-xs font-medium text-muted-foreground pt-4 border-t border-border/50">
                <div className="flex items-start gap-4"><Calendar className="h-4 w-4 text-primary" />
                  <div><span className="block text-[9px] uppercase opacity-50">Date</span>{activeBooking.event_date}</div>
                </div>
                <div className="flex items-start gap-4"><User className="h-4 w-4 text-primary" />
                  <div><span className="block text-[9px] uppercase opacity-50">Pax</span>{parsedNotes.guestRange?.max || 'TBD'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {isChef && !isBookingLocked && (
                <ModifyTermsDialog booking={activeBooking} conversationId={chatId} currentUserId={userId} />
              )}
              
              {!isChef && !isBookingLocked && (
                <AcceptQuoteDialog 
                  bookingId={activeBooking.id} 
                  conversationId={chatId} 
                  currentUserId={userId} 
                  price={parsedNotes.price || 0} 
                />
              )}

              {isBookingLocked && (
                <>
                  <Button disabled className="text-[9px] uppercase tracking-widest h-10 rounded-none bg-muted text-muted-foreground">
                    <Lock className="w-3 h-3 mr-2" /> Terms Locked
                  </Button>
                  <Button 
                    onClick={downloadTranscript}
                    variant="outline" 
                    className="text-[9px] uppercase tracking-widest h-10 rounded-none border-primary text-primary hover:bg-primary/5"
                  >
                    <Download className="w-3 h-3 mr-2" /> Export Transcript
                  </Button>
                </>
              )}
              
              <Button variant="outline" className="text-[9px] uppercase tracking-widest h-10 rounded-none opacity-50">
                <FileText className="w-3 h-3 mr-2" /> View Invoice
              </Button>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
           <p className="text-[9px] text-muted-foreground text-center italic opacity-50">End-to-end encrypted. System v1.1.0</p>
        </div>
      </aside>
    </div>
  )
}