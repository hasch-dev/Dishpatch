'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, Archive, AlertCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { parseISO, isBefore, startOfDay } from 'date-fns'

import BookingDossierPanel from '@/components/user/booking-dossier-panel'
import BookingCard from '@/components/user/booking-card'
import ArchivePanel from '@/components/user/archive-panel'
import BookingControls from '@/components/user/booking-controls'

type BookingStatus = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

type ModalConfig = {
  title: string;
  message: string;
  type: 'warning' | 'error';
  onConfirm?: () => void;
  confirmLabel?: string;
} | null;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

export default function UserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [archivedBookings, setArchivedBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<BookingStatus>('all')
  const [modal, setModal] = useState<ModalConfig>(null)
  const [notification, setNotification] = useState<any | null>(null)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  
  // Pipeline Query States
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const router = useRouter()
  const supabase = createClient()

  const fetchBookings = async (uid: string) => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        
      if (error) throw error

      const today = startOfDay(new Date());
      const rawBookings = bookings || [];

      const chefIds = Array.from(new Set(rawBookings.map(b => b.chef_id).filter(Boolean)));
      let chefProfilesMap: Record<string, any> = {};
      
      if (chefIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, display_name').in('id', chefIds);
        if (profiles) {
          chefProfilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      const enriched = rawBookings.map((booking) => {
        let currentStatus = booking.status;
        const pendingStatuses = ['open', 'negotiating', 'pending'];
        
        // Map database statuses to standard UI tabs
        if (pendingStatuses.includes(currentStatus?.toLowerCase())) {
            currentStatus = 'pending';
        }
        
        if (currentStatus === 'pending' && booking.event_date) {
          if (isBefore(parseISO(booking.event_date), today)) currentStatus = 'expired';
        }

        return {
          ...booking,
          artisan: booking.chef_id && chefProfilesMap[booking.chef_id] ? { display_name: chefProfilesMap[booking.chef_id].display_name } : null,
          ui_status: currentStatus // mapped status for UI filtering
        };
      });

      setUserBookings(enriched.filter(b => !b.client_purged))
      setArchivedBookings(enriched.filter(b => b.client_purged))
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')
      fetchBookings(user.id)
    }
    initDashboard()
  }, [router, supabase])

  const filteredBookings = useMemo(() => {
    let dataset = [...userBookings];

    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        dataset = dataset.filter(b => ['confirmed', 'in_progress'].includes(b.status));
      } else {
        dataset = dataset.filter(b => b.ui_status === activeTab);
      }
    }

    if (typeFilter !== 'all') {
      dataset = dataset.filter(b => {
        const dbType = b.booking_type?.toLowerCase() || '';
        if (typeFilter === 'private') return dbType.includes('private');
        return dbType === typeFilter.toLowerCase();
      });
    }

    if (searchQuery.trim() !== '') {
      const token = searchQuery.toLowerCase().trim();
      dataset = dataset.filter(b => 
        b.title?.toLowerCase().includes(token) ||
        b.location_city?.toLowerCase().includes(token) ||
        b.artisan?.display_name?.toLowerCase().includes(token)
      );
    }

    dataset.sort((x, y) => {
      if (sortBy === 'created_desc') return new Date(y.created_at).getTime() - new Date(x.created_at).getTime();
      if (sortBy === 'created_asc') return new Date(x.created_at).getTime() - new Date(y.created_at).getTime();
      if (sortBy === 'event_desc') return (y.event_date ? new Date(y.event_date).getTime() : 0) - (x.event_date ? new Date(x.event_date).getTime() : 0);
      if (sortBy === 'event_asc') return (x.event_date ? new Date(x.event_date).getTime() : 0) - (y.event_date ? new Date(y.event_date).getTime() : 0);
      return 0;
    });

    return dataset;
  }, [userBookings, activeTab, typeFilter, searchQuery, sortBy]);

  const handleArchive = async (bookingId: string) => {
    const bookingToArchive = userBookings.find(b => b.id === bookingId);
    
    setUserBookings(prev => prev.filter(b => b.id !== bookingId));
    if (bookingToArchive) setArchivedBookings(prev => [{ ...bookingToArchive, client_purged: true }, ...prev]);
    
    setModal(null);
    if (selectedBooking?.id === bookingId) setSelectedBooking(null);

    const { error } = await supabase
      .from('bookings')
      .update({ client_purged: true })
      .eq('id', bookingId);

    if (error) {
      if (bookingToArchive) fetchBookings(bookingToArchive.user_id);
      setModal({ title: "Archive Failed", message: error.message, type: 'error' });
    }
  }

  const promptArchive = (e: React.MouseEvent | any, booking: any) => {
    e?.stopPropagation?.();
    if (booking.status === 'expired' || booking.status === 'completed') {
      handleArchive(booking.id);
      return;
    }

    setModal({
      title: "Archive Booking?",
      message: `Are you sure you want to move "${booking.title || 'this booking'}" to your archive? You can still view it later.`,
      type: 'warning',
      confirmLabel: "Yes, Archive it",
      onConfirm: () => handleArchive(booking.id)
    });
  }

  const handleEditAttempt = (e: React.MouseEvent | any, booking: any) => {
    e?.stopPropagation?.();
    if (['completed', 'cancelled', 'expired'].includes(booking.status)) {
      setModal({ title: "Cannot Edit", message: "This booking is closed and can no longer be modified.", type: 'error' });
      return;
    }
    router.push(`/booking/edit/${booking.id}`)
  }

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-5 font-sans">
      <div className="text-xs tracking-[0.4em] text-muted-foreground animate-pulse uppercase font-bold">
        Loading Reservations...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24">
      
      {/* Premium Notification Toast Anchor */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 right-6 z-[200] bg-card border border-primary/30 p-6 w-[360px] rounded-xl shadow-2xl"
          >
            {/* Notification content remains the same */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Bar */}
      <nav className="h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-50 border-b border-border/20">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push('/')}>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-primary">
            Client Dashboard
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsArchiveOpen(true)}
            className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors group flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Archive</span>
            {archivedBookings.length > 0 && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center font-bold">
                {archivedBookings.length}
              </div>
            )}
          </button>
          
          <Button 
            onClick={() => router.push('/booking/new')} 
            className="rounded-full h-10 px-5 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <header className="mb-10">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter italic mb-8">
            My Reservations
          </h2>
          
          {/* Custom Category Tracking Tabs */}
          <div className="flex flex-wrap items-center gap-6 border-b border-border/20 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'pending', 'active', 'completed', 'cancelled'] as BookingStatus[]).map((tab) => {
              const count = activeTab === 'all' 
                ? userBookings.length 
                : tab === 'active' 
                  ? userBookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length 
                  : userBookings.filter(b => b.ui_status === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-2 pb-3 transition-all relative group shrink-0",
                    activeTab === tab ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-sm capitalize">{tab}</span>
                  <span className="text-xs text-muted-foreground/60 bg-muted px-1.5 rounded-md">
                    {count}
                  </span>
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tab-underline" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" 
                    />
                  )}
                </button>
              )
            })}
          </div>
        </header>

        {/* Filters */}
        <BookingControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        {/* Render Cards */}
        {filteredBookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-border/40 p-16 text-center bg-muted/5 rounded-2xl mt-8"
          >
            <p className="text-lg font-serif italic text-muted-foreground">
              No reservations found.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Adjust your filters or create a new booking to get started.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible" layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -4 }}
                >
                  <BookingCard
                    booking={booking}
                    onSelect={() => setSelectedBooking(booking)}
                    onEdit={(e) => handleEditAttempt(e, booking)}
                    onPurge={(e) => promptArchive(e, booking)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Slide-out Panels & Modals */}
      <ArchivePanel
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        bookings={archivedBookings}
        onViewBrief={(booking) => { setSelectedBooking(booking); setIsArchiveOpen(false); }}
      />

      <AnimatePresence>
        {selectedBooking && (
          <BookingDossierPanel 
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)} 
            onEdit={(e: any) => handleEditAttempt(e, selectedBooking)} 
            onDelete={(e: any) => promptArchive(e, selectedBooking)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 15 }} 
              className="relative w-full max-w-sm bg-card border border-border/50 p-8 rounded-2xl shadow-2xl text-center"
            >
              <div className={cn("w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center", modal.type === 'error' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-serif italic mb-2">{modal.title}</h3>
              <p className="text-sm text-muted-foreground mb-8">{modal.message}</p>
              <div className="flex flex-col gap-2">
                {modal.onConfirm && (
                  <Button onClick={modal.onConfirm} variant={modal.type === 'error' ? "destructive" : "default"} className="w-full rounded-full">
                    {modal.confirmLabel || "Confirm"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setModal(null)} className="w-full rounded-full text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}