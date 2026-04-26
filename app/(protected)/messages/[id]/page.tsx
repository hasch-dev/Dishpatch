"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Send, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [userId, setUserId] = React.useState<string | null>(null)
  const supabase = createClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    setupChat()

    const channel = supabase
      .channel(`chat:${params.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${params.id}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id, supabase])

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const { error } = await supabase.from('messages').insert({
      conversation_id: params.id,
      content: newMessage,
      sender_id: userId
    })

    if (!error) setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-background max-w-5xl mx-auto border-x border-border shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h2 className="font-serif italic font-bold text-xl leading-none">Conversation</h2>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span>Secure Channel</span>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-muted/5">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-5 py-3 shadow-sm ${
                isMe 
                  ? 'bg-primary text-primary-foreground rounded-t-3xl rounded-bl-3xl' 
                  : 'bg-card text-foreground border border-border rounded-t-3xl rounded-br-3xl'
              }`}>
                <p className="text-md font-light leading-relaxed">{msg.content}</p>
                <span className="text-[10px] opacity-50 mt-2 block text-right font-serif italic">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-card border-t border-border flex gap-4">
        <Input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Craft your message..."
          className="bg-background border-border h-14 rounded-full px-6 font-serif italic text-lg focus-visible:ring-primary shadow-inner"
        />
        <Button type="submit" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shrink-0">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}