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
  ChevronRight, Search, MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    if (!confirm("Are you sure you want to cancel this booking?")) return
    setUserBookings(prev => prev.filter(b => b.id !== id))
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_assignment: "bg-amber-50 text-amber-700 border-amber-100",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      default: "bg-slate-50 text-slate-600 border-slate-200"
    }
    const currentStyle = styles[status] || styles.default
    return (
      <Badge className={`rounded-full shadow-none font-medium text-[10px] uppercase tracking-wider px-2.5 py-0.5 border ${currentStyle}`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (isLoading) return <div className="w-full h-screen p-8 animate-pulse bg-slate-50/50" />

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 font-sans">
      
      {/* NAVBAR */}
      <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Dashboard</h1>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <p className="text-xs text-slate-500 hidden sm:block">Manage your culinary experiences</p>
          </div>
          <Button 
            onClick={() => {}} 
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg h-8 px-3 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Event
          </Button>
        </div>
      </nav>

      <main className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto">
        
        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Upcoming', val: userBookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Awaiting Chef', val: userBookings.filter(b => b.status === 'pending_assignment').length, icon: Clock, color: 'text-amber-500' },
            { label: 'Total Volume', val: userBookings.length, icon: Utensils, color: 'text-slate-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{s.val}</p>
              </div>
              <s.icon className={`h-5 w-5 ${s.color} opacity-80`} />
            </div>
          ))}
        </section>

        {/* BOOKINGS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tighter">Your Experiences</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Search className="h-3.5 w-3.5" /> Filter by Status
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userBookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all cursor-pointer hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="p-5 pb-0 flex justify-between items-start">
                  <div className="space-y-3">
                    {getStatusBadge(booking.status)}
                    <h4 className="text-[17px] font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                      {booking.title}
                    </h4>
                  </div>
                  <button 
                    onClick={(e) => handleCancel(e, booking.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-5 py-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Date</p>
                      <p className="text-[13px] font-semibold text-slate-700">
                        {new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Group</p>
                      <p className="text-[13px] font-semibold text-slate-700">{booking.guest_count} pax</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${booking.chef_id ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-slate-200'}`}>
                      <ChefHat className={`h-3 w-3 ${booking.chef_id ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {booking.chef_id ? 'Chef Assigned' : 'Seeking Chef...'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* DRAWER / SIDE SUMMARY */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-full sm:max-w-md bg-white p-0 flex flex-col border-l border-slate-200">
          
          <SheetHeader className="p-8 border-b border-slate-100">
            <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">
              Booking Summary
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {selectedBooking && getStatusBadge(selectedBooking.status)}
                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Private Event
                </p>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                {selectedBooking?.title}
              </h3>
            </div>

            {/* Scannable Data Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Event Date</span>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedBooking?.event_date ? new Date(selectedBooking.event_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '-'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Party Size</span>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedBooking?.guest_count} Attendees
                </p>
              </div>
            </div>

            {/* Chef Status Card */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-white flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${selectedBooking?.chef_id ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                <ChefHat className={`h-6 w-6 ${selectedBooking?.chef_id ? 'text-orange-600' : 'text-slate-300'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">
                  {selectedBooking?.chef_id ? "Chef Reserved" : "Selection in Progress"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {selectedBooking?.chef_id 
                    ? "A professional has been assigned to your booking." 
                    : "We're matching your request with top local chefs."}
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="p-8 border-t border-slate-100 bg-slate-50/50">
            <Button 
              onClick={() => router.push(`/booking/${selectedBooking?.id}`)} 
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold transition-all shadow-lg active:scale-[0.98]"
            >
              Manage Booking File <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}