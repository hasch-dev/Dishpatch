'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChefHat, Send, ChevronLeft, Calendar, 
  User, DollarSign, Info, Clock, CheckCircle2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

export default function UserMessagePage() {
  const { id: bookingId } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      setCurrentUser(user)

      // Fetch Booking with conversation and related Chef Profile
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          conversations(id),
          chef:profiles!bookings_chef_id_fkey(display_name, avatar_url)
        `)
        .eq('id', bookingId)
        .single()

      if (error || !bookingData?.conversations?.length) {
        router.push('/user-dashboard')
        return
      }

      setBooking(bookingData)
      const convoId = bookingData.conversations[0].id

      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true })

      setMessages(msgData ?? [])
      setIsLoading(false)

      const channel = supabase
        .channel(`convo:${convoId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${convoId}` 
        }, (payload) => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    setupChat()
  }, [bookingId, router, supabase])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !booking?.conversations[0]?.id) return
    const content = newMessage
    setNewMessage('')

    await supabase.from('messages').insert({
      conversation_id: booking.conversations[0].id,
      sender_id: currentUser.id,
      content
    })
  }

  if (isLoading) return <div className="h-screen flex items-center justify-center font-serif text-[10px] tracking-[0.4em] uppercase opacity-40">Decrypting_Thread...</div>

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-background border border-border/40 m-4 overflow-hidden shadow-2xl">
      
      {/* SECTION 1: INBOX / SELECTOR (LEFT) */}
      <div className="w-72 border-r border-border/40 flex flex-col bg-muted/10">
        <div className="p-6 border-b border-border/40 bg-background/50">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Active Commissions</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active Chat Card */}
          <div className="p-4 bg-primary/5 border-l-2 border-primary cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center border border-primary/20">
                <ChefHat className="h-4 w-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-serif italic truncate">{booking.chef?.display_name || 'Assigned Artisan'}</p>
                <p className="text-[9px] uppercase tracking-tighter opacity-50 truncate">{booking.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAIN MESSAGING (MIDDLE) */}
      <div className="flex-1 flex flex-col bg-background">
        <header className="h-16 px-6 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Secure Archive</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUser?.id
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
              >
                <div className={cn(
                  "max-w-[80%] p-4 text-sm font-serif leading-relaxed",
                  isMe ? "bg-primary text-primary-foreground italic" : "bg-muted/50 border border-border/40"
                )}>
                  {msg.content}
                </div>
                <span className="mt-1 text-[7px] uppercase tracking-widest opacity-30 px-1">
                  {format(parseISO(msg.created_at), 'HH:mm')}
                </span>
              </motion.div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* BUDGET PROTOCOL SECTION (BOTTOM OF MIDDLE) */}
        <div className="mx-8 p-4 bg-muted/30 border border-border/40 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                    <p className="text-[9px] uppercase font-bold tracking-tighter">Current Budget Protocol</p>
                    <p className="text-sm font-serif italic text-primary">${booking.budget}</p>
                </div>
            </div>
            <Button variant="outline" className="h-8 text-[9px] uppercase tracking-widest border-primary/20 hover:bg-primary/5">
                Propose Revision
            </Button>
        </div>

        {/* INPUT */}
        <div className="p-6 border-t border-border/40 bg-background">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Submit directive..."
              className="flex-1 bg-muted/20 border border-border/60 h-12 px-6 font-serif italic text-sm focus:outline-none focus:border-primary/40"
            />
            <Button type="submit" className="h-12 w-12 rounded-none bg-primary">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* SECTION 3: COMMISSION DETAILS (RIGHT) */}
      <div className="w-80 border-l border-border/40 flex flex-col bg-muted/5">
        <div className="p-8 space-y-10">
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Artisan Profile</h4>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-muted border border-border/40" />
               <div>
                  <p className="font-serif text-lg italic leading-none">{booking.chef?.display_name || 'Assigned Chef'}</p>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">Lead Gastronomist</p>
               </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border/40">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Booking Brief</h4>
            <DetailItem icon={<Calendar className="h-3 w-3"/>} label="Timeline" value={booking.event_date ? format(parseISO(booking.event_date), 'MMMM dd, yyyy') : 'TBD'} />
            <DetailItem icon={<Clock className="h-3 w-3"/>} label="Time" value={booking.event_time || 'TBD'} />
            <DetailItem icon={<User className="h-3 w-3"/>} label="Party Size" value={`${booking.guest_count} Guests`} />
            <DetailItem icon={<Info className="h-3 w-3"/>} label="Type" value={booking.booking_type || 'Custom Commission'} />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 space-y-2 mt-auto">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span className="text-[9px] uppercase font-bold tracking-widest">Status: {booking.status}</span>
            </div>
            <p className="text-[10px] italic opacity-60 leading-relaxed font-serif">
                This channel is locked to the specific brief. All agreements here are binding to the commission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 opacity-40">{icon}</div>
      <div>
        <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">{label}</p>
        <p className="text-[11px] font-serif italic">{value}</p>
      </div>
    </div>
  )
}