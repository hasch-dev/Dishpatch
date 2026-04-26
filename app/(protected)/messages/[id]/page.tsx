"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, Calendar, Info, MapPin, ShieldCheck } from "lucide-react"

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [chatInfo, setChatInfo] = React.useState<any>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const supabase = createClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // Fetch Full Chat Context + Partner Profile
      const { data: conv } = await supabase
        .from('conversations')
        .select(`*, chef:chef_id(*), client:client_id(*)`)
        .eq('id', params.id)
        .single()
      
      setChatInfo(conv)

      // Fetch History
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: true })
      
      if (msgs) setMessages(msgs)
    }

    setupChat()
    
    const channel = supabase.channel(`chat:${params.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${params.id}` }, 
      (payload) => setMessages((prev) => [...prev, payload.new]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id, supabase])

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return
    const { error } = await supabase.from('messages').insert({ conversation_id: params.id, content: newMessage, sender_id: userId })
    if (!error) setNewMessage("")
  }

  const isChef = chatInfo?.chef_id === userId
  const partner = isChef ? chatInfo?.client : chatInfo?.chef

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* COLUMN 2: The Chat (Middle) */}
      <div className="flex-1 flex flex-col bg-background relative border-r border-border">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card/20 flex justify-between items-center">
          <div>
            <h2 className="font-serif italic font-bold text-lg">{partner?.display_name}</h2>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="h-2 w-2 text-primary" /> Active Consultation
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
          {messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'
                }`}>
                  <p className="text-sm font-light">{msg.content}</p>
                  <span className="text-[9px] opacity-50 mt-1 block text-right italic font-serif">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-6 bg-card border-t border-border flex gap-3">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type a message..."
            className="rounded-full px-6 italic bg-background border-border"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0 shadow-lg">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* COLUMN 3: Profile Details (Right) */}
      <aside className="w-80 bg-card/10 p-8 hidden 2xl:flex flex-col gap-10">
        <div className="text-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif italic text-4xl mx-auto mb-6 shadow-inner">
            {partner?.display_name?.[0]}
          </div>
          <h3 className="font-bold text-xl uppercase tracking-tighter text-foreground">{partner?.display_name}</h3>
          <p className="text-[11px] text-primary uppercase tracking-[0.3em] mt-1 font-bold">{partner?.user_type}</p>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2 border-b border-border pb-2">
            <Info className="h-3 w-3" /> Partner Profile
          </h4>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 text-foreground/80">
              <User className="h-4 w-4 text-primary" />
              <span>Member since {new Date(partner?.created_at).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Dishpatch Verified</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-mono text-[10px]">CONV-{params.id.slice(0,8)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold border-primary/20 hover:bg-primary/5">
            View Public Profile
          </Button>
          <p className="text-[9px] text-muted-foreground text-center italic">
            Consultation data is private and encrypted.
          </p>
        </div>
      </aside>
    </div>
  )
}