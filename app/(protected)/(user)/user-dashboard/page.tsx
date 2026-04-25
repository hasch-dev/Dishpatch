'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { 
  Plus, Calendar, Users, ChefHat, 
  Search, DollarSign, X, Trash2, Hash, ArrowRight, MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [userName, setUserName] = useState("Member")

  const router = useRouter()
  const supabase = createClient()

  const handleCreateNew = () => {
    router.push('/booking/new')
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
        if (profile?.display_name) setUserName(profile.display_name)
        
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error) {
          setUserBookings(data || []) 
        }
      } catch (error) {
        console.error("Dashboard error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [router, supabase])

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm("Retire this engagement?")) return
    
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (!error) {
        setUserBookings(prev => prev.filter(b => b.id !== id))
        if (selectedBooking?.id === id) setSelectedBooking(null)
    }
  }

  const filteredBookings = userBookings.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background italic font-serif text-muted-foreground font-medium tracking-widest transition-colors duration-500">
        Initialising Studio...
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent transition-colors duration-500">
      
      {/* STUDIO NAV */}
      <nav className="h-14 border-b border-border bg-card sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-1">
             <ChefHat className="h-4 w-4" />
          </div>
          <h1 className="font-serif text-sm tracking-widest uppercase font-bold">
            Dishpatch <span className="text-muted-foreground font-light ml-2">Studio</span>
          </h1>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-8 px-5 text-[9px] font-bold uppercase tracking-widest transition-all"
        >
          <Plus className="mr-2 h-3 w-3" /> New File
        </Button>
      </nav>

      <main className="max-w-[1300px] mx-auto px-8 pt-12 pb-20">
        
        {/* HEADER & SEARCH */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif text-foreground leading-tight tracking-tight">Welcome, {userName}.</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-2">
               <Hash className="h-3 w-3 text-primary" /> Active Dossiers: {filteredBookings.length}
            </p>
          </div>

          <div className="relative group">
            <Input 
              placeholder="Search database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 bg-card border-border rounded-none shadow-sm focus-visible:ring-1 focus-visible:ring-primary italic text-xs transition-all pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </header>

        {/* BOOKING GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBooking(booking)}
                className="group relative bg-card border border-border rounded-sm hover:border-primary transition-all cursor-pointer flex flex-col h-64 shadow-sm overflow-hidden"
              >
                <div className={cn(
                  "h-1 w-full",
                  booking.status === 'confirmed' ? "bg-emerald-500" : "bg-amber-400"
                )} />

                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-tighter">REF: {booking.id.slice(0, 8)}</span>
                    <button 
                      onClick={(e) => handleCancel(e, booking.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-serif font-medium text-foreground leading-snug line-clamp-2 mb-6 group-hover:italic transition-all">
                    {booking.title || "Untitled Engagement"}
                  </h3>

                  <div className="space-y-2 mb-auto">
                    <div className="flex justify-between text-[9px] border-b border-border pb-1">
                      <span className="text-muted-foreground uppercase font-bold tracking-tighter">Engagement</span>
                      <span className="font-medium text-foreground italic uppercase tracking-widest text-[8px]">{booking.booking_type}</span>
                    </div>
                    <div className="flex justify-between text-[9px] border-b border-border pb-1">
                      <span className="text-muted-foreground uppercase font-bold tracking-tighter">Attendance</span>
                      <span className="font-medium text-foreground italic">{booking.guest_count || '1'} PAX</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground">
                      <DollarSign className="h-3 w-3 text-emerald-600" />
                      <span>{booking.budget ? `$${Number(booking.budget).toLocaleString()}` : 'Quote Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                       <Calendar className="h-2.5 w-2.5" />
                       {booking.event_date || 'TBD'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div 
            onClick={handleCreateNew}
            className="border-2 border-dashed border-border flex flex-col items-center justify-center p-6 space-y-3 cursor-pointer hover:bg-card hover:border-primary transition-all h-64 group"
          >
            <div className="h-10 w-10 bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Commission File</p>
          </div>
        </div>
      </main>

      {/* ENGAGEMENT DOSSIER (SIDE DRAWER) */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card border-l border-border p-0 flex flex-col shadow-2xl">
          {selectedBooking && (
            <>
              <div className="p-10 bg-primary text-primary-foreground">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 rounded-none text-[8px] uppercase tracking-widest text-white">
                    {selectedBooking.status?.replace('_', ' ') || 'Pending Review'}
                  </Badge>
                  <button onClick={(e) => handleCancel(e, selectedBooking.id)} className="text-primary-foreground/60 hover:text-primary-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-3xl font-serif italic leading-tight">{selectedBooking.title}</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] mt-4 opacity-50 font-bold">Client Archive</p>
              </div>

              <div className="flex-1 p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-2 gap-y-8 gap-x-10">
                  {[
                    ['Member', userName], 
                    ['Engagement', selectedBooking.booking_type], 
                    ['Attendance', `${selectedBooking.guest_count || 1} Pax`], 
                    ['Date', selectedBooking.event_date || 'TBD'],
                    ['Location', selectedBooking.location_address || 'TBD'],
                    ['Budget', selectedBooking.budget ? `$${selectedBooking.budget}` : 'Pending']
                  ].map(([label, val]) => (
                    <div key={label} className="space-y-1">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
                      <p className="text-sm font-serif italic text-foreground">{val || '—'}</p>
                    </div>
                  ))}
                </div>
                
                {selectedBooking.dietary_restrictions && (
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Dietary Restrictions</p>
                    <p className="text-xs font-serif italic text-muted-foreground">{selectedBooking.dietary_restrictions}</p>
                  </div>
                )}

                <div className="p-6 border-l-2 border-primary bg-muted/50 space-y-2">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Studio Directive</p>
                   <p className="text-xs italic text-muted-foreground leading-relaxed font-serif">
                     {selectedBooking.chef_id 
                        ? 'An artisan has been formally assigned to this file. Communications are now active.' 
                        : 'Your dossier is currently being reviewed by the Studio curators for artisan matching.'}
                   </p>
                </div>
              </div>

              <div className="p-10 border-t border-border flex flex-col gap-3">
                <Button 
                    onClick={() => router.push('/user-messages')} 
                    className="w-full h-12 rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primary/90 transition-all"
                >
                  Go to Engagement Hub
                </Button>
                <Button 
                    variant="outline" 
                    onClick={() => setSelectedBooking(null)} 
                    className="w-full rounded-none border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest h-10 transition-all hover:bg-accent"
                >
                  Close Archive
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}