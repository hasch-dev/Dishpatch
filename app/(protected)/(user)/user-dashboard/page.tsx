'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  CalendarDays, 
  UserCircle2, 
  Trash2, 
  Edit3,
  Lock,
  Archive,
  X,
  Ghost,
  History
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'

import BookingDossierPanel from '@/components/booking-dossier-panel'

type BookingStatus = 'all' | 'open' | 'active' | 'completed' | 'cancelled' | 'expired';

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
  const [archivedBookings, setArchivedBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<BookingStatus>('all')
  const [modal, setModal] = useState<ModalConfig>(null)
  const [notification, setNotification] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  
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
        let currentStatus = booking.status;

        // 1. IMPROVED EXPIRATION CHECK
        // Include any status that represents a booking not yet "confirmed" or "completed"
        const expirationalStatuses = ['open', 'negotiating', 'pending'];
        
        if (expirationalStatuses.includes(currentStatus?.toLowerCase()) && booking.event_date) {
          const eventDate = parseISO(booking.event_date);
          
          if (isBefore(eventDate, today)) {
            currentStatus = 'expired';
          }
        }

        // 2. Fetch artisan profile if assigned
        // Note: We check if it's NOT expired here so we don't waste a query on dead records
        if (booking.chef_id && !['pending', 'cancelled', 'expired'].includes(currentStatus)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', booking.chef_id)
            .single();
              
          return { ...booking, artisan: profile, status: currentStatus };
        }

        return { ...booking, status: currentStatus };
      }))

      setUserBookings(enriched.filter(b => !b.client_purged))
      setArchivedBookings(enriched.filter(b => b.client_purged))
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

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return userBookings;
    
    // If user clicks the 'expired' tab, show items where status was locally set to 'expired'
    return userBookings.filter(b => b.status === activeTab);
  }, [userBookings, activeTab]);

  const getCount = (tab: BookingStatus) => {
    if (tab === 'all') return userBookings.length;
    if (tab === 'active') {
      return userBookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length;
    } 
    return userBookings.filter(b => b.status === tab).length;
  };

  const handlePurge = async (bookingId: string) => {
    const bookingToPurge = userBookings.find(b => b.id === bookingId);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        client_purged: true,
        notes: `${bookingToPurge?.notes || ""}\n\n[SYSTEM: Client purged this record on ${new Date().toISOString()}]` 
      })
      .eq('id', bookingId);

    if (error) {
      console.error("Failed to purge:", error);
      setModal({ title: "Purge Failed", message: error.message || "Database policy restriction.", type: 'error' });
      return;
    }

    if (bookingToPurge) {
      setUserBookings(prev => prev.filter(b => b.id !== bookingId));
      setArchivedBookings(prev => [{ ...bookingToPurge, client_purged: true }, ...prev]);
    }
    
    setModal(null);
    if (selectedBooking?.id === bookingId) setSelectedBooking(null);
  }

  const handleEditAttempt = (e: React.MouseEvent, booking: any) => {
    e.stopPropagation()
    if (['completed', 'cancelled', 'expired'].includes(booking.status)) {
      setModal({ title: "Modification Restricted", message: `Commission is ${booking.status}.`, type: 'error' });
      return;
    }
    if (booking.edit_count >= 2) {
      setModal({ title: "Revision Limit", message: "Security clearance limit reached.", type: 'error' })
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
      
      {/* Existing Notifications & Nav stay the same... */}
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
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsArchiveOpen(true)}
            className="relative p-2 opacity-40 hover:opacity-100 transition-opacity group"
          >
            {archivedBookings.length > 0 && (
              <div className="text-[7px] absolute top-0 right-0 bg-primary text-primary-foreground w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {archivedBookings.length}
              </div>
            )}
            <Archive className="h-4 w-4" />
          </button>
          <Button onClick={() => router.push('/booking/new')} size="sm" className="rounded-none h-9 px-6 text-[9px] uppercase tracking-[0.2em] font-bold">
            <Plus className="mr-2 h-3 w-3" /> New Commission
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <header className="mb-12 sticky">
          <div className="flex items-center gap-3 opacity-40 mb-4">
            <div className="h-[1px] w-6 bg-foreground" />
            <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Private Client Portal</p>
          </div>
          <h2 className="text-6xl font-serif tracking-tighter italic leading-none mb-12">Studio Archive</h2>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border/10">
              {['all', 'open', 'active', 'completed', 'cancelled', 'expired'].map((tab) => (
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
                  variants={cardVariants} initial="initial" animate="animate" exit="exit" whileHover={!isExpired ? "hover" : ""}
                  onClick={() => !isExpired && setSelectedBooking(booking)}
                  className={cn(
                    "group bg-card border border-border/40 p-10 flex flex-col justify-between aspect-[16/9] relative overflow-hidden transition-all",
                    isExpired ? "cursor-default" : "cursor-pointer hover:border-primary/40 hover:bg-muted/5",
                    ['cancelled', 'completed'].includes(booking.status) && "opacity-50 grayscale-[0.4]"
                  )}
                >
                  {/* EXPIRED OVERLAY: BLUR + PURGE ACTION */}
                  <AnimatePresence>
                    {isExpired && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-background/20 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                      >
                        <div className="bg-destructive/10 border border-destructive/20 p-8 flex flex-col items-center max-w-xs shadow-2xl">
                          <History className="h-6 w-6 text-destructive mb-4 animate-pulse" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive mb-2">Record Expired</h4>
                          <p className="text-[11px] font-serif italic text-muted-foreground mb-6 leading-relaxed">
                            This appointment date has passed. To clear your workspace, you must purge this record.
                          </p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePurge(booking.id); }}
                            className="bg-destructive text-white px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-destructive/80 transition-colors shadow-lg flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" /> Purge Record
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* UNDERLYING CONTENT (Blurred/Grayscale if Expired) */}
                  <div className={cn("flex flex-col h-full justify-between", isExpired && "blur-[2px] grayscale opacity-30")}>
                    <div className="flex justify-between items-start relative z-10">
                      <div className={cn(
                        "text-[8px] font-bold uppercase tracking-widest px-3 py-1 border",
                        ['confirmed', 'assigned'].includes(booking.status)
                          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" 
                          : "text-primary border-primary/20 bg-primary/5",
                      )}>
                        {booking.status.replace(/_/g, ' ')}
                      </div>
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all text-primary" />
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
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Rest of the components (Archive, Dossier Panel, Modals) remain the same... */}
      {/* GHOST ARCHIVE PANEL */}
      <AnimatePresence>
        {isArchiveOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsArchiveOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-[101] p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-serif italic">Ghost Archive</h3>
                  <p className="text-[9px] uppercase tracking-widest opacity-40 mt-1">Read-Only Dossiers</p>
                </div>
                <button onClick={() => setIsArchiveOpen(false)} className="p-2 hover:bg-muted transition-colors">
                  <X className="h-5 w-5 opacity-40" />
                </button>
              </div>

              <div className="space-y-6">
                {archivedBookings.length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                    <Ghost className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-[10px] uppercase tracking-widest">No purged records</p>
                  </div>
                ) : (
                  archivedBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="p-8 border border-border/40 bg-muted/5 opacity-60 grayscale hover:grayscale-0 transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Lock className="h-3 w-3 opacity-30" />
                        <span className="text-[8px] font-mono opacity-30">ARCH_{booking.id.slice(0,8).toUpperCase()}</span>
                      </div>
                      <h4 className="text-xl font-serif italic mb-1">{booking.title}</h4>
                      <p className="text-[10px] opacity-40 mb-6">
                        {booking.event_date ? format(parseISO(booking.event_date), 'MMMM dd, yyyy') : 'No Date Set'}
                      </p>
                      
                      <div className="pt-4 border-t border-border/10 flex justify-between items-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{booking.status}</span>
                        <button 
                          onClick={() => { setSelectedBooking(booking); setIsArchiveOpen(false); }}
                          className="text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                        >
                          View Brief
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedBooking && (
        <BookingDossierPanel 
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)} 
          onEdit={() => router.push(`/booking/edit/${selectedBooking.id}`)} 
          onDelete={() => handlePurge(selectedBooking.id)} 
        />
      )}

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