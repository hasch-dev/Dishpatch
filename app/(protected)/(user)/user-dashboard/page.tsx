'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { 
  ChefHat, 
  Trash2, 
  Edit3, 
  Plus, 
  ArrowUpRight, 
  AlertCircle,
  X,
  CheckCircle2, // Added for notification
  ArrowRight    // Added for notification
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { format, parseISO } from 'date-fns'

// --- DIAGNOSTIC TYPES ---
type ModalConfig = {
  title: string;
  message: string;
  type: 'warning' | 'error';
  onConfirm?: () => void;
  confirmLabel?: string;
} | null;

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [modal, setModal] = useState<ModalConfig>(null)
  
  // --- NEW STATES FOR NOTIFICATIONS ---
  const [notification, setNotification] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // --- DATA ACQUISITION & ERROR BOUNDARY ---
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth/login')
          return
        }
        
        setUserId(user.id) // Save ID for realtime listener

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (fetchError) throw fetchError
        setUserBookings(data ?? [])
      } catch (err) {
        console.error("Studio Sync Error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [router, supabase])

  // --- REALTIME LISTENER FOR ACCEPTED BOOKINGS ---
  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel(`public:bookings`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `client_id=eq.${userId}` }, // Use user_id or client_id based on your schema
        async (payload) => {
          if (payload.new.status === 'assigned' && payload.old.status !== 'assigned') {
            
            const { data: chefData } = await supabase.from('profiles').select('display_name').eq('id', payload.new.chef_id).single()
            const { data: conv } = await supabase.from('conversations')
              .select('id').eq('chef_id', payload.new.chef_id).eq('client_id', userId).single()

            setNotification({
              chefName: chefData?.display_name || "An Artisan",
              bookingTitle: payload.new.title,
              chatId: conv?.id
            })
            
            // Auto-hide toast after 8 seconds
            setTimeout(() => setNotification(null), 8000)
            
            // Refresh dashboard data
            const { data } = await supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
            if (data) setUserBookings(data)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // --- ACTION HANDLERS ---
  const handleCancelAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (booking.status !== 'pending_assignment') {
      setModal({
        title: "Dossier Locked",
        message: "Artisan review has commenced. Status modifications are currently restricted.",
        type: 'error'
      })
      return
    }

    setModal({
      title: "Confirm Withdrawal",
      message: "Are you certain you wish to withdraw this commission? This action will purge the archive record.",
      type: 'warning',
      confirmLabel: "Withdraw Commission",
      onConfirm: async () => {
        const { error } = await supabase.from('bookings').delete().eq('id', booking.id)
        if (!error) {
          setUserBookings(prev => prev.filter(b => b.id !== booking.id))
          setModal(null)
        }
      }
    })
  }

  const handleEditAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (booking.edit_count >= 2) {
      setModal({
        title: "Revision Limit",
        message: "Security clearance limit reached (2/2). Contact the studio for manual override.",
        type: 'error'
      })
      return
    }
    router.push(`/booking/edit/${booking.id}`)
  }

  const showDate = (d: string) => {
    try { return d ? format(parseISO(d), 'MMM dd, yyyy') : 'TBD' } catch { return 'TBD' }
  }

  // --- TYPED ANIMATION VARIANTS ---
  const cardVariants: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        y: { type: "spring", stiffness: 100, damping: 20 },
        opacity: { duration: 0.4 } 
      } 
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
    hover: {
      y: -6,
      borderColor: "var(--primary)",
      boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="font-serif text-[10px] tracking-[0.5em] animate-pulse opacity-40 uppercase italic">Synchronizing_Studio...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 relative">
      
      {/* --- NOTIFICATION TOAST OVERLAY --- */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-card border border-border shadow-2xl p-6 w-[400px]"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-serif italic font-bold text-lg leading-tight mb-1">Commission Accepted</h4>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{notification.chefName}</strong> has accepted the directive for <strong className="text-foreground">{notification.bookingTitle}</strong>.
                </p>
                {notification.chatId && (
                  <Button onClick={() => router.push(`/messages/${notification.chatId}`)} className="w-full mt-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] h-10 rounded-none">
                    Enter the Suite <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                )}
              </div>
              <button onClick={() => setNotification(null)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <nav className="h-16 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
          <ChefHat className="h-4 w-4 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-serif text-xs font-bold uppercase tracking-[0.2em]">Dishpatch</span>
        </div>
        <Button onClick={() => router.push('/booking/new')} size="sm" className="rounded-none h-9 px-6 text-[9px] uppercase tracking-widest font-bold">
          <Plus className="mr-2 h-3 w-3" /> Initiate Commission
        </Button>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <header className="mb-16 flex items-end justify-between border-b border-border/20 pb-8">
          <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary">Archive</p>
            <h2 className="text-4xl font-serif tracking-tighter italic leading-none">Studio Collection</h2>
          </div>
          <div className="flex gap-8">
            <Stat label="Active" value={userBookings.length} />
            <Stat label="Pending" value={userBookings.filter(b => b.status === 'pending_assignment').length} />
          </div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {userBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                onClick={() => setSelectedBooking(booking)}
                className="group bg-card border border-border/60 p-10 flex flex-col justify-between aspect-[3/2] cursor-pointer relative"
              >
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2 py-1 border",
                    booking.status === 'confirmed' ? "text-emerald-600 border-emerald-500/20 bg-emerald-500/5" : "text-primary border-primary/20 bg-primary/5"
                  )}>
                    {booking.status.replace(/_/g, ' ')}
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-10 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif leading-tight group-hover:italic transition-all truncate">
                    {booking.title || "Untitled Commission"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    {booking.booking_type} • {showDate(booking.event_date)}
                  </p>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-border/10">
                   <div className="text-[9px] font-mono opacity-30 uppercase tracking-tighter">Clearance: {booking.edit_count}/2</div>
                   <div className="flex gap-5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button onClick={(e) => handleEditAttempt(e, booking)} className="hover:text-primary transition-colors"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={(e) => handleCancelAttempt(e, booking)} className="hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- CUSTOM STUDIO MODAL --- */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-card border border-border p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className={cn("h-5 w-5", modal.type === 'error' ? "text-destructive" : "text-primary")} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Studio Notice</span>
                </div>
                <button onClick={() => setModal(null)} className="hover:rotate-90 transition-transform"><X className="h-4 w-4 opacity-40"/></button>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif italic tracking-tighter leading-none">{modal.title}</h3>
                <p className="text-sm font-serif italic text-muted-foreground leading-relaxed">"{modal.message}"</p>
              </div>
              <div className="flex justify-end gap-6 pt-4">
                <Button variant="ghost" onClick={() => setModal(null)} className="text-[9px] uppercase tracking-widest hover:bg-transparent">Dismiss</Button>
                {modal.onConfirm && (
                  <Button onClick={modal.onConfirm} className="rounded-none bg-destructive text-destructive-foreground h-10 px-6 text-[9px] uppercase tracking-widest font-bold">
                    {modal.confirmLabel || "Confirm"}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAIL SHEET --- */}
      <Sheet open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-md bg-background border-l border-border/40 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Commission Dossier: {selectedBooking?.title || 'Details'}</SheetTitle>
            <SheetDescription>Archive records and creative directives for this engagement.</SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="flex flex-col h-full">
              <div className="p-10 border-b border-border/40 bg-muted/10">
                <p className="text-[8px] uppercase font-bold text-primary mb-2 tracking-[0.3em]">Commission Dossier</p>
                <h2 className="text-3xl font-serif italic tracking-tighter leading-none">{selectedBooking.title}</h2>
              </div>
              <div className="flex-1 p-10 space-y-12 overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                  <MiniDetail label="Timeline" value={showDate(selectedBooking.event_date)} />
                  <MiniDetail label="Pax" value={selectedBooking.guest_count} />
                  <MiniDetail label="Budget" value={`$${selectedBooking.budget || '0'}`} />
                  <MiniDetail label="Status" value={selectedBooking.status.replace(/_/g, ' ')} />
                </div>
                <div className="pt-8 border-t border-border/40">
                  <p className="text-[9px] font-bold uppercase opacity-40 mb-4 tracking-widest">Creative Directive</p>
                  <p className="text-md font-serif leading-relaxed italic text-foreground/80">"{selectedBooking.notes || 'No specific directives provided.'}"</p>
                </div>
              </div>
              <div className="p-8 border-t border-border/40 flex justify-end bg-muted/5">
                <Button variant="ghost" className="text-[9px] uppercase tracking-widest hover:bg-transparent" onClick={() => setSelectedBooking(null)}>Close Archive</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

const Stat = ({ label, value }: { label: string, value: number }) => (
  <div className="flex items-baseline gap-3">
    <span className="text-[8px] uppercase font-bold opacity-30 tracking-[0.2em]">{label}</span>
    <span className="text-3xl font-serif italic leading-none">{value}</span>
  </div>
)

const MiniDetail = ({ label, value }: { label: string, value: any }) => (
  <div className="space-y-1.5">
    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-[0.15em]">{label}</p>
    <p className="text-lg font-serif">{value}</p>
  </div>
)