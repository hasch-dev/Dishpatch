'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  ChefHat, 
  Trash2, 
  Edit3, 
  Plus, 
  ArrowUpRight, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Clock,
  CreditCard,
  UtensilsCrossed,
  MapPin,
  CalendarDays,
  UserCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { format, parseISO } from 'date-fns'

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
  const [notification, setNotification] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const fetchBookings = async (uid: string) => {
    try {
      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError

      const enrichedBookings = await Promise.all((bookings || []).map(async (booking) => {
        if (booking.chef_id && booking.status !== 'pending') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', booking.chef_id)
            .single()
          return { ...booking, artisan: profile }
        }
        return booking
      }))

      setUserBookings(enrichedBookings)
    } catch (err: any) {
      console.error("Studio Sync Error:", err.message || err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)
      fetchBookings(user.id)
    }
    loadDashboard()
  }, [router, supabase])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel(`public:bookings`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` },
        async (payload) => {
          if (payload.new.status === 'assigned' && payload.old.status !== 'assigned') {
            const { data: chefData } = await supabase.from('profiles').select('display_name').eq('id', payload.new.chef_id).single()
            const { data: conv } = await supabase.from('conversations').select('id').eq('chef_id', payload.new.chef_id).eq('client_id', userId).single()
            
            setNotification({ 
              chefName: chefData?.display_name || "An Artisan", 
              bookingTitle: payload.new.title, 
              chatId: conv?.id 
            })
            
            setTimeout(() => setNotification(null), 8000)
            fetchBookings(userId)
          }
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const handleCancelAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (booking.status !== 'pending') {
      setModal({ title: "Dossier Locked", message: "Artisan review has commenced. Status modifications are restricted.", type: 'error' })
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
          if (selectedBooking?.id === booking.id) setSelectedBooking(null)
        }
      }
    })
  }

  const handleEditAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (booking.edit_count >= 2) {
      setModal({ title: "Revision Limit", message: "Security clearance limit reached (2/2). Contact the studio for manual override.", type: 'error' })
      return
    }
    router.push(`/booking/edit/${booking.id}`)
  }

  const showDate = (d: string) => {
    try { return d ? format(parseISO(d), 'MMM dd, yyyy') : 'TBD' } catch { return 'TBD' }
  }

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    },
    exit: { opacity: 0, scale: 0.98 },
    hover: { 
      y: -4, 
      transition: { 
        type: "spring", 
        stiffness: 250, 
        damping: 30 
      } 
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4 font-sans">
      <div className="text-[10px] tracking-[0.6em] animate-pulse opacity-40 uppercase italic">Accessing_Dossiers</div>
      <div className="h-[1px] w-12 bg-primary/20" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 font-sans">
      
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className="fixed top-6 right-6 z-[200] bg-card border border-primary/20 shadow-2xl p-5 w-[340px] rounded-none"
          >
            <div className="flex gap-4">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Update</p>
                <p className="text-sm italic text-foreground/90"><strong className="text-foreground">{notification.chefName}</strong> accepted <span className="text-primary underline underline-offset-4">{notification.bookingTitle}</span>.</p>
                {notification.chatId && (
                  <Button onClick={() => router.push(`/messages/${notification.chatId}`)} className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[8px] h-8 rounded-none group">
                    Enter Chat <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="h-16 px-8 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-50 border-b border-border/10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push('/')}>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Dashboard</span>
        </div>
        <Button onClick={() => router.push('/booking/new')} size="sm" className="rounded-none h-9 px-6 text-[9px] uppercase tracking-[0.2em] font-bold">
          <Plus className="mr-2 h-3 w-3" /> New Commission
        </Button>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3 opacity-40">
            <div className="h-[1px] w-6 bg-foreground" />
            <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Private Client Portal</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-5xl font-serif tracking-tighter italic leading-none">Studio Archive</h2>
            <div className="flex gap-8 border-l border-border/20 pl-8">
              <Stat label="Total Records" value={userBookings.length} />
              <Stat label="Awaiting Artisan" value={userBookings.filter(b => b.status === 'pending').length} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {userBookings.map((booking) => (
              <motion.div 
                key={booking.id} 
                variants={cardVariants} 
                initial="initial" animate="animate" exit="exit" whileHover="hover"
                onClick={() => setSelectedBooking(booking)}
                className="group bg-card border border-border/40 p-8 flex flex-col justify-between aspect-[16/9] cursor-pointer relative overflow-hidden transition-all hover:border-primary/40 hover:bg-muted/5"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />

                <div className="flex justify-between items-start relative z-10">
                  <div className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 border",
                    booking.status === 'confirmed' || booking.status === 'assigned' 
                      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" 
                      : "text-primary border-primary/20 bg-primary/5"
                  )}>
                    {booking.status.replace(/_/g, ' ')}
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity text-primary" />
                </div>

                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-serif leading-tight tracking-tight">
                    {booking.title || "Untitled Commission"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 text-primary/40" />
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{showDate(booking.event_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.event_time_pref === 'Noon' ? <Sun className="h-3 w-3 text-amber-500/60" /> : <Moon className="h-3 w-3 text-indigo-400/60" />}
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{booking.event_time_pref || 'TBD'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-border/10 relative z-10">
                   <div className="flex items-center gap-3">
                    {booking.artisan ? (
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[9px] italic text-foreground/80 font-serif">Artisan: {booking.artisan.display_name}</span>
                      </div>
                    ) : (
                      <span className="text-[8px] font-mono opacity-30 uppercase tracking-[0.1em]">REV_{booking.edit_count || 0}/02</span>
                    )}
                   </div>
                   <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={(e) => handleEditAttempt(e, booking)} className="p-1.5 hover:text-primary transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => handleCancelAttempt(e, booking)} className="p-1.5 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* --- NOTICES & DIALOGS --- */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="absolute inset-0 bg-background/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative w-full max-w-sm bg-card border border-border p-10 shadow-3xl text-center font-sans">
              <AlertCircle className={cn("h-8 w-8 mx-auto mb-6", modal.type === 'error' ? "text-destructive" : "text-primary")} />
              <h3 className="text-2xl font-serif italic tracking-tighter mb-3">{modal.title}</h3>
              <p className="text-sm italic text-muted-foreground leading-relaxed mb-8">"{modal.message}"</p>
              <div className="flex flex-col gap-3">
                {modal.onConfirm && (
                  <Button onClick={modal.onConfirm} className="rounded-none bg-destructive text-destructive-foreground h-11 uppercase tracking-widest text-[9px] font-bold">
                    {modal.confirmLabel || "Confirm"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setModal(null)} className="text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100">Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <DialogContent asChild className="outline-none">
          {/* FIX: All children must be inside the motion.div when using asChild */}
          <motion.div 
            layoutId={selectedBooking?.id}
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 flex flex-col w-[98vw] !max-w-none lg:w-[90vw] xl:w-[85vw] max-h-[92vh] bg-card border border-border/40 p-0 overflow-hidden rounded-none outline-none font-sans"
          >
            <DialogHeader className="p-10 border-b border-border/10 bg-muted/5 shrink-0">
              <div className="flex justify-between items-end gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-[1px] w-4 bg-primary/60" />
                    <p className="text-[9px] uppercase font-bold text-primary tracking-[0.4em]">Active Record</p>
                  </div>
                  <DialogTitle className="text-5xl font-serif italic tracking-tighter leading-none">
                    {selectedBooking?.title || "Untitled Commission"}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailed view of your private booking record.
                  </DialogDescription>
                </div>
                <div className="text-right pb-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 mb-1">Phase</p>
                  <p className="text-2xl font-serif italic text-primary">
                    {selectedBooking?.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {selectedBooking && (
              <>
                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  {/* FIX: grid-rows-2 instead of grid-row-2 */}
                  <div className="grid grid-rows-2 md:grid-cols-4 lg:grid-cols-7 gap-8 border-b border-border/5 pb-12">
                    <MiniDetail icon={Clock} label="Timeline" value={`${showDate(selectedBooking.event_date)} @ ${selectedBooking.event_time_pref || 'TBD'}`} />
                    <MiniDetail icon={ChefHat} label="Tier" value={selectedBooking.service_package || "Bespoke"} />
                    <MiniDetail icon={CreditCard} label="Billing" value={selectedBooking.payment_plan || "Full"} />
                    <MiniDetail icon={MapPin} label="Destination" value={selectedBooking.location_city} />
                    <MiniDetail icon={UtensilsCrossed} label="Pax" value={`${selectedBooking.guest_count} Guests`} />
                    <MiniDetail icon={CreditCard} label="Budget" value={`₱${selectedBooking.budget_min?.toLocaleString()} - ₱${selectedBooking.budget_max?.toLocaleString()}`} />
                    <MiniDetail icon={UserCircle2} label="Artisan" value={selectedBooking.artisan?.display_name || "Unassigned"} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    <div className="space-y-12">
                      <div>
                        <SectionTitle label="Creative Directives" />
                        <div className="bg-muted/5 border border-border/10 p-8">
                          <p className="text-xl text-foreground/90 whitespace-pre-wrap leading-relaxed italic font-serif">
                            {selectedBooking.notes ? `"${selectedBooking.notes}"` : "No specific directives provided."}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <SectionTitle label="Site Orientation" />
                        <p className="text-lg text-foreground/70 leading-relaxed border-l-2 border-primary/20 pl-8 italic">
                          {selectedBooking.location_address || "No address provided."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div>
                        <SectionTitle label="Menu Selections" />
                        <div className="flex flex-wrap gap-3">
                          {selectedBooking.menu_selections?.length > 0 ? (
                            selectedBooking.menu_selections.map((item: string) => (
                              <span key={item} className="text-[11px] border border-primary/20 px-4 py-2 bg-primary/5 uppercase tracking-widest font-bold">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm opacity-40 italic">Open Palette (Chef's Choice).</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <SectionTitle label="Dietary Exclusions" color="destructive" />
                        <div className="flex flex-wrap gap-3">
                          {selectedBooking.excluded_menu_items?.length > 0 ? (
                            selectedBooking.excluded_menu_items.map((item: string) => (
                              <span key={item} className="text-[11px] border border-destructive/30 px-4 py-2 bg-destructive/5 text-destructive line-through uppercase tracking-widest font-bold">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm opacity-40 italic">No specific exclusions identified.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-10 py-8 border-t border-border/10 flex justify-between bg-muted/5 shrink-0">
                  <Button variant="ghost" className="text-destructive text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-destructive/5 h-12 px-8" onClick={(e) => handleCancelAttempt(e, selectedBooking)}>
                    Purge Record
                  </Button>
                  <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-foreground/5 h-12 px-8" onClick={() => setSelectedBooking(null)}>
                    Dismiss Dossier
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const Stat = ({ label, value }: { label: string, value: number }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] uppercase font-bold opacity-30 tracking-[0.2em]">{label}</span>
    <span className="text-3xl font-serif italic leading-none">{value.toString().padStart(2, '0')}</span>
  </div>
)

const MiniDetail = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
  <div className="space-y-3 font-sans min-w-[120px]">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary opacity-50" />}
      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-[0.15em]">{label}</p>
    </div>
    <p className="text-lg leading-tight font-medium break-words text-foreground">{value}</p>
  </div>
)

const SectionTitle = ({ label, color = "primary" }: { label: string, color?: string }) => (
  <div className="flex items-center gap-3 mb-4 font-sans">
    <div className={cn("h-[1px] w-8", color === 'destructive' ? 'bg-destructive/40' : 'bg-primary/40')} />
    <p className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", color === 'destructive' ? 'text-destructive' : 'text-primary')}>
      {label}
    </p>
  </div>
)