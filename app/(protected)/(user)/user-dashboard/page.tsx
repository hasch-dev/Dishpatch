'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sun, 
  Moon, 
  CalendarDays, 
  UserCircle2, 
  Trash2, 
  Edit3,
  Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'

import BookingDossierPanel from '@/components/booking-dossier-panel'

type BookingStatus = 'all' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';

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
  const [activeTab, setActiveTab] = useState<BookingStatus>('all')
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

      const today = startOfDay(new Date());

      const enriched = await Promise.all((bookings || []).map(async (booking) => {
        let status = booking.status;
        
        // Safety Precaution: Logical check for Expired state
        if (status === 'pending' && booking.event_date && isBefore(parseISO(booking.event_date), today)) {
          status = 'expired';
        }

        if (booking.chef_id && !['pending', 'cancelled', 'expired'].includes(status)) {
          const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', booking.chef_id).single()
          return { ...booking, artisan: profile, status };
        }
        return { ...booking, status };
      }))

      setUserBookings(enriched)
    } catch (err: any) {
      console.error("Studio Sync Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      setUserId(user.id)
      fetchBookings(user.id)
    }
    loadDashboard()
  }, [router, supabase])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel(`public:bookings`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'bookings', 
        filter: `user_id=eq.${userId}` 
      }, async (payload) => {
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
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return userBookings;
    if (activeTab === 'active') return userBookings.filter(b => ['assigned', 'confirmed'].includes(b.status));
    return userBookings.filter(b => b.status === activeTab);
  }, [userBookings, activeTab]);

  const getCount = (tab: BookingStatus) => {
    if (tab === 'all') return userBookings.length;
    if (tab === 'active') return userBookings.filter(b => ['assigned', 'confirmed'].includes(b.status)).length;
    return userBookings.filter(b => b.status === tab).length;
  };

  const handlePurge = async (bookingId: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
    if (!error) {
      setUserBookings(prev => prev.filter(b => b.id !== bookingId))
      setModal(null)
      if (selectedBooking?.id === bookingId) setSelectedBooking(null)
    }
  }

  const handleEditAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (['completed', 'cancelled', 'expired'].includes(booking.status)) {
      setModal({ 
        title: "Modification Restricted", 
        message: `This commission is marked as ${booking.status}. Changes are no longer permitted.`, 
        type: 'error' 
      });
      return;
    }

    if (booking.edit_count >= 2) {
      setModal({ title: "Revision Limit", message: "Security clearance limit reached (2/2).", type: 'error' })
      return
    }
    router.push(`/booking/edit/${booking.id}`)
  }

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98 },
    hover: { y: -4, transition: { type: "spring", stiffness: 250, damping: 30 } }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4 font-sans text-foreground">
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

      <main className="max-w-6xl mx-auto px-8 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 opacity-40 mb-4">
            <div className="h-[1px] w-6 bg-foreground" />
            <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Private Client Portal</p>
          </div>
          <h2 className="text-6xl font-serif tracking-tighter italic leading-none mb-12">Studio Archive</h2>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border/10">
            {['all', 'pending', 'active', 'completed', 'cancelled', 'expired'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as BookingStatus)}
                className={cn(
                  "flex items-center gap-2 pb-4 px-1 transition-all relative group",
                  activeTab === tab ? "opacity-100" : "opacity-30 hover:opacity-60"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab}</span>
                <span className="text-[9px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">({getCount(tab as BookingStatus)})</span>
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => {
              const isExpired = booking.status === 'expired';
              
              return (
                <motion.div 
                  key={booking.id} 
                  variants={cardVariants} initial="initial" animate="animate" exit="exit" whileHover="hover"
                  onClick={() => !isExpired && setSelectedBooking(booking)}
                  className={cn(
                    "group bg-card border border-border/40 p-10 flex flex-col justify-between aspect-[16/9] relative overflow-hidden transition-all",
                    isExpired ? "cursor-default" : "cursor-pointer hover:border-primary/40 hover:bg-muted/5",
                    ['cancelled', 'completed'].includes(booking.status) && "opacity-50 grayscale-[0.4]"
                  )}
                >
                  {/* EXPIRED LOCK OVERLAY */}
                  <AnimatePresence>
                    {isExpired && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20 bg-destructive/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-destructive/40 via-transparent to-transparent" />
                        <Lock className="h-6 w-6 text-destructive mb-4 relative z-10" />
                        <p className="text-[11px] font-serif italic text-destructive-foreground font-bold leading-relaxed relative z-10 mb-6">
                          Your appointment for {booking.event_date ? format(parseISO(booking.event_date), 'MMM dd') : 'this day'} has expired. <br />
                          Would you like to delete this entry?
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePurge(booking.id); }}
                          className="relative z-10 bg-destructive text-white px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-destructive/80 transition-colors shadow-lg"
                        >
                          Purge Record
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-start relative z-10">
                    <div className={cn(
                      "text-[8px] font-bold uppercase tracking-widest px-3 py-1 border",
                      ['confirmed', 'assigned'].includes(booking.status)
                        ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" 
                        : "text-primary border-primary/20 bg-primary/5",
                      isExpired && "text-destructive border-destructive/20 bg-destructive/5"
                    )}>
                      {booking.status.replace(/_/g, ' ')}
                    </div>
                    {!isExpired && <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all text-primary" />}
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-serif leading-tight tracking-tight">
                      {booking.title || "Untitled Commission"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary/40" />
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                          {booking.event_date ? format(parseISO(booking.event_date), 'MMM dd, yyyy') : 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-border/10 relative z-10">
                    <div className="flex items-center gap-4">
                      {booking.artisan ? (
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-[10px] italic text-foreground/80 font-serif">Artisan: {booking.artisan.display_name}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.2em]">REV_{booking.edit_count || 0}/02</span>
                      )}
                    </div>
                    
                    {!['completed', 'cancelled', 'expired'].includes(booking.status) && (
                      <div className="flex gap-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={(e) => handleEditAttempt(e, booking)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                          <Edit3 className="h-3.5 w-3.5" /> Modify
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setModal({ 
                              title: "Confirm Withdrawal", 
                              message: "Are you certain you wish to withdraw this commission?", 
                              type: 'warning', 
                              confirmLabel: "Withdraw", 
                              onConfirm: () => handlePurge(booking.id) 
                            }); 
                          }} 
                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Purge
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <BookingDossierPanel 
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)} onEdit={function (booking: any): void {
          throw new Error('Function not implemented.')
        } } onDelete={function (booking: any): void {
          throw new Error('Function not implemented.')
        } }      />

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative w-full max-w-sm bg-card border border-border p-12 shadow-3xl text-center">
              <AlertCircle className={cn("h-10 w-10 mx-auto mb-8", modal.type === 'error' ? "text-destructive" : "text-primary")} />
              <h3 className="text-3xl font-serif italic tracking-tighter mb-4">{modal.title}</h3>
              <p className="text-sm italic text-muted-foreground leading-relaxed mb-10">"{modal.message}"</p>
              <div className="flex flex-col gap-4">
                {modal.onConfirm && (
                  <Button onClick={modal.onConfirm} className="rounded-none bg-destructive text-destructive-foreground h-12 uppercase tracking-widest text-[10px] font-black">
                    {modal.confirmLabel || "Confirm"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setModal(null)} className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 h-12">Return to Archive</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}