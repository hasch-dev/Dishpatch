'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Archive, AlertCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { parseISO, isBefore, startOfDay, addDays, differenceInDays, differenceInHours } from 'date-fns'

import BookingDossierPanel from '@/components/user/booking-dossier-panel'
import BookingCard from '@/components/user/booking-card'
import ArchivePanel from '@/components/user/archive-panel'
import BookingControls from '@/components/user/booking-controls'

type BookingStatus = 'all' | 'pending' | 'awaiting_payment' | 'active' | 'completed' | 'cancelled';

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
        let currentStatus = booking.status?.toLowerCase();
        let paymentDaysLeft = null;
        let paymentHoursLeft = null;

        const isPending = ['open', 'negotiating', 'pending'].includes(currentStatus);
        
        if (isPending) {
            currentStatus = 'pending';
            if (booking.event_date && isBefore(parseISO(booking.event_date), today)) {
              currentStatus = 'expired';
            }
        } 
        else if (['confirmed', 'in_progress'].includes(currentStatus)) {
            // 3-Day Payment Window Logic
            if (booking.payment_status === 'pending') {
                currentStatus = 'awaiting_payment';
                // Calculate 3 days from when it was last updated (accepted by chef)
                const baseDate = booking.updated_at ? parseISO(booking.updated_at) : parseISO(booking.created_at);
                const deadline = addDays(baseDate, 3);
                
                paymentDaysLeft = differenceInDays(deadline, new Date());
                paymentHoursLeft = differenceInHours(deadline, new Date());

                if (paymentHoursLeft < 0) currentStatus = 'payment_overdue';
            } else if (booking.payment_status === 'paid') {
                currentStatus = 'active';
            }
        }

        return {
          ...booking,
          artisan: booking.chef_id && chefProfilesMap[booking.chef_id] ? { display_name: chefProfilesMap[booking.chef_id].display_name } : null,
          ui_status: currentStatus,
          paymentDaysLeft,
          paymentHoursLeft
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
      // With ui_status, the mapping is strictly 1:1 to the tabs now
      dataset = dataset.filter(b => b.ui_status === activeTab || (activeTab === 'awaiting_payment' && b.ui_status === 'payment_overdue'));
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
    if (['expired', 'completed', 'cancelled'].includes(booking.status)) {
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

  const TABS: { id: BookingStatus, label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'awaiting_payment', label: 'Awaiting Payment' },
    { id: 'active', label: 'Paid & Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24">
      
      {/* Main Navigation Bar - Height reduced from h-20 to h-16 for space efficiency */}
      <nav className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-50 border-b border-border/20">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push('/')}>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-primary">
            Client Dashboard
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsArchiveOpen(true)}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Archive</span>
            {archivedBookings.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-muted text-foreground text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center font-bold border border-border/50">
                {archivedBookings.length}
              </div>
            )}
          </button>
          
          <Button 
            onClick={() => router.push('/booking/new')} 
            className="rounded-full h-9 px-4 text-xs font-bold shadow-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Booking
          </Button>
        </div>
      </nav>

      {/* Main Content Layout - Max width increased, vertical padding reduced */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-serif tracking-tighter italic mb-4">
                My Reservations
                </h2>
                
                {/* Custom Category Tracking Tabs */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 border-b border-border/20 overflow-x-auto no-scrollbar pb-1">
                {TABS.map((tab) => {
                    const count = tab.id === 'all' 
                    ? userBookings.length 
                    : userBookings.filter(b => b.ui_status === tab.id || (tab.id === 'awaiting_payment' && b.ui_status === 'payment_overdue')).length;

                    return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                        "flex items-center gap-2 pb-3 transition-all relative group shrink-0",
                        activeTab === tab.id ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span className="text-sm">{tab.label}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded-md">
                        {count}
                        </span>
                        {activeTab === tab.id && (
                        <motion.div 
                            layoutId="tab-underline" 
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" 
                        />
                        )}
                    </button>
                    )
                })}
                </div>
            </div>
        </div>

        {/* Filters - Wrapped in a subtle container to prevent "floating" clash */}
        <div className="bg-muted/10 p-3 rounded-xl border border-border/40 mb-6 flex-shrink-0">
            <BookingControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            />
        </div>

        {/* Render Cards */}
        {filteredBookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-border/40 p-12 text-center bg-muted/5 rounded-2xl mt-4"
          >
            <p className="text-lg font-serif italic text-muted-foreground">
              No reservations found in this view.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible" layout
            // Grid columns increased heavily so cards aren't overly stretched
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 items-start"
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

      {/* Modal Renderer remains the same */}
      <AnimatePresence>
        {modal && (
            // ... (Your modal code here remains unchanged)
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