'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from "@/components/ui/sheet"
import { 
  Plus, Calendar, Users, ChefHat, Utensils,
  CheckCircle2, Clock, Trash2, ArrowUpRight,
  ChevronRight, Search, MapPin, Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Booking {
  id: string
  title: string
  event_date: string
  guest_count: number
  status: string
  chef_id: string | null
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      
      const response = await fetch(`/api/bookings?user_id=${user.id}`)
      if (response.ok) { 
        const { data } = await response.json()
        setUserBookings(data || []) 
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to retire this booking file?")) return
    setUserBookings(prev => prev.filter(b => b.id !== id))
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_assignment: "border-primary/20 text-primary bg-primary/5",
      confirmed: "border-emerald-500/20 text-emerald-600 bg-emerald-500/5",
      default: "border-secondary/20 text-secondary/60 bg-secondary/5"
    }
    const currentStyle = styles[status] || styles.default
    return (
      <Badge variant="outline" className={cn("rounded-none font-bold text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border italic", currentStyle)}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (isLoading) return <div className="w-full h-screen bg-background animate-pulse flex items-center justify-center text-primary italic font-serif">Dishpatch...</div>

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* ROYAL NAVY NAVBAR */}
      <nav className="w-full border-b border-primary/10 bg-secondary sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-serif tracking-widest uppercase text-secondary-foreground">Dashboard</h1>
            <div className="h-4 w-px bg-primary/20" />
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-secondary-foreground/40 uppercase tracking-[0.3em] font-bold">
              <Sparkles className="w-3 h-3 text-primary" />
              Member Console
            </div>
          </div>
          <Button 
            onClick={() => {}} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-12 px-8 text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-primary/10 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> New Engagement
          </Button>
        </div>
      </nav>

      <main className="px-8 lg:px-16 py-12 space-y-16 max-w-[1600px] mx-auto">
        
        {/* STATS SECTION - MINIMALIST CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: 'Upcoming', val: userBookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle2 },
            { label: 'Pending Selection', val: userBookings.filter(b => b.status === 'pending_assignment').length, icon: Clock },
            { label: 'Total Dossiers', val: userBookings.length, icon: Utensils },
          ].map((s, i) => (
            <div key={i} className="group border-b border-primary/10 p-6 flex items-end justify-between hover:border-primary transition-colors">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">{s.label}</p>
                <p className="text-5xl font-serif text-foreground">{s.val}</p>
              </div>
              <s.icon className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </section>

        {/* BOOKINGS GRID */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-primary/10 pb-6">
            <h3 className="text-3xl font-serif text-foreground tracking-tight">The <span className="italic text-primary">Portfolio</span></h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              <Search className="h-3.5 w-3.5" /> Search Engagements
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {userBookings.map((booking) => (
              <motion.div 
                key={booking.id} 
                whileHover={{ y: -5 }}
                onClick={() => setSelectedBooking(booking)}
                className="group cursor-pointer space-y-6"
              >
                {/* Image Placeholder / Visual Block */}
                <div className="relative aspect-[4/3] bg-secondary overflow-hidden border border-primary/5">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 backdrop-blur-sm">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Open File</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-serif text-foreground leading-tight group-hover:text-primary transition-colors italic">
                      {booking.title}
                    </h4>
                    <button 
                      onClick={(e) => handleCancel(e, booking.id)}
                      className="p-1 text-muted-foreground/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-8 border-t border-primary/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        {new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        {booking.guest_count} Attendees
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* DRAWER: THE DOSSIER SUMMARY */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-secondary p-0 flex flex-col border-l border-primary/10 text-secondary-foreground">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10 pointer-events-none" />
          
          <SheetHeader className="p-12 border-b border-primary/10 relative z-10">
            <SheetTitle className="text-3xl font-serif tracking-tight text-secondary-foreground italic">
              Engagement <span className="text-primary underline underline-offset-8 decoration-1 font-sans not-italic">File</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 p-12 space-y-12 overflow-y-auto relative z-10">
            <div className="space-y-6">
              {selectedBooking && getStatusBadge(selectedBooking.status)}
              <h3 className="text-4xl font-serif text-secondary-foreground leading-[1.1]">
                {selectedBooking?.title}
              </h3>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-primary italic">
                <MapPin className="h-3 w-3" /> Private Estate Location
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-8 border border-primary/10 bg-background/5 space-y-2">
                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.4em] block">Scheduled Date</span>
                <p className="text-xl font-serif">
                  {selectedBooking?.event_date ? new Date(selectedBooking.event_date).toLocaleDateString(undefined, { dateStyle: 'full' }) : '-'}
                </p>
              </div>
              
              <div className="p-8 border border-primary/10 bg-background/5 space-y-2">
                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.4em] block">Chef Designation</span>
                <div className="flex items-center gap-4 pt-2">
                  <div className={cn(
                    "h-12 w-12 rounded-none border flex items-center justify-center",
                    selectedBooking?.chef_id ? "border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-primary/10"
                  )}>
                    <ChefHat className={cn("h-6 w-6", selectedBooking?.chef_id ? "text-primary" : "text-primary/20")} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest italic">
                      {selectedBooking?.chef_id ? "Artisan Assigned" : "Selection Pending"}
                    </p>
                    <p className="text-[10px] text-secondary-foreground/40 mt-1 uppercase tracking-tighter">
                      Curating top-tier culinary talent for your approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="p-12 border-t border-primary/10 bg-background/5 relative z-10">
            <Button 
              onClick={() => router.push(`/booking/${selectedBooking?.id}`)} 
              className="w-full h-16 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.4em] text-[11px] shadow-2xl"
            >
              Full Portfolio View <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}