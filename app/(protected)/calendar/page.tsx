"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Clock, UserCircle2, AlertCircle, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, parseISO, isBefore, startOfDay } from 'date-fns'

interface Booking {
  id: string
  date?: string 
  event_date?: string
  time?: string
  event_time_pref?: string
  title: string
  status: string
  chef_id: string
  artisan?: {
    display_name: string
    avatar_url?: string
  }
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function CalendarPage() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const fetchCalendarData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single()

    const userRole = profile?.user_type as "chef" | "user"

    let query = supabase.from("bookings").select("*")
    if (userRole === "chef") {
      query = query.eq("chef_id", user.id).eq("status", "accepted")
    } else {
      query = query.eq("user_id", user.id)
    }

    const { data: fetchedBookings } = await query

    const enriched = await Promise.all((fetchedBookings || []).map(async (b) => {
      if (b.chef_id && b.status !== 'pending') {
        const { data: chefProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', b.chef_id)
          .single()
        return { ...b, artisan: chefProfile }
      }
      return b
    }))

    setBookings(enriched)
    setIsLoading(false)
  }

  React.useEffect(() => {
    fetchCalendarData()
  }, [supabase])

  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
    
    const cells = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ day: daysInPrevMonth - firstDayOfMonth + i + 1, isCurrentMonth: false, dateString: null })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      cells.push({ day: i, isCurrentMonth: true, dateString: dStr })
    }
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isCurrentMonth: false, dateString: null })
    }
    return cells
  }, [currentYear, currentMonth])

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="text-[10px] tracking-[0.6em] animate-pulse opacity-40 uppercase italic">Archive_Indexing</div>
      <div className="h-[1px] w-12 bg-primary/20" />
    </div>
  )

  return (
    <div className="flex flex-col h-full w-full bg-background p-8 font-sans selection:bg-primary/20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 opacity-30">
            <div className="h-[1px] w-8 bg-foreground" />
            <p className="text-[8px] font-bold uppercase tracking-[0.5em]">Scheduling Studio</p>
          </div>
          <h1 className="text-6xl font-serif italic text-foreground tracking-tighter leading-none">
            {MONTHS[currentMonth]} <span className="text-primary not-italic font-sans font-light ml-4">{currentYear}</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center border border-border/60 p-1 bg-muted/5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-background" onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="w-[1px] h-4 bg-border/40 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-background" onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col border border-border/60 bg-card overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-border/20 bg-muted/5">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-5 text-center text-[8px] uppercase tracking-[0.4em] font-bold text-muted-foreground/40">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 bg-border/10 gap-[1px]">
          {calendarCells.map((cell, idx) => {
            const dayBookings = cell.isCurrentMonth && cell.dateString
              ? bookings.filter(b => (b.event_date || b.date) === cell.dateString)
              : []
            
            const hasEvents = dayBookings.length > 0
            
            // Purged Logic: Past + (Not Confirmed/Accepted)
            const isPast = cell.dateString && isBefore(parseISO(cell.dateString), startOfDay(new Date()))
            const isMissed = isPast && dayBookings.some(b => b.status !== 'confirmed' && b.status !== 'accepted')

            return (
              <div 
                key={idx} 
                className={cn(
                  "relative min-h-[160px] p-5 flex flex-col gap-4 transition-all duration-700 group",
                  !cell.isCurrentMonth ? "bg-muted/5 opacity-10 pointer-events-none" : "bg-background hover:bg-muted/5",
                  hasEvents && !isMissed && "bg-primary/[0.03]"
                )}
              >
                {isMissed && (
                  <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="h-4 w-4 text-white/20 mb-2" />
                    <span className="text-white/20 text-[7px] uppercase tracking-[0.5em] font-bold">Purged_Dossier</span>
                  </div>
                )}

                <div className="flex justify-between items-start relative z-10">
                  <span className={cn(
                    "text-xs font-serif font-bold transition-all duration-500",
                    hasEvents ? "text-primary text-xl underline decoration-primary/30 underline-offset-4" : "text-muted-foreground/40"
                  )}>
                    {String(cell.day).padStart(2, '0')}
                  </span>
                  {hasEvents && !isMissed && <Bookmark className="h-3 w-3 text-primary/40 fill-primary/10" />}
                </div>

                <div className="flex flex-col gap-2.5 relative z-10">
                  {dayBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className={cn(
                        "flex flex-col p-3 border-l-2 transition-all duration-300",
                        booking.status === 'confirmed' || booking.status === 'accepted'
                          ? "bg-primary border-primary shadow-[4px_4px_15px_-5px_rgba(212,175,55,0.3)]"
                          : "bg-muted/10 border-border/60"
                      )}
                    >
                      <span className={cn(
                        "text-[9px] font-serif italic font-bold leading-none tracking-tight truncate mb-2",
                        booking.status === 'confirmed' || booking.status === 'accepted' ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {booking.title || "Untitled Commission"}
                      </span>
                      
                      <div className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-1.5 text-[7px] uppercase font-black tracking-widest">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{booking.event_time_pref || booking.time || 'TBD'}</span>
                        </div>
                        {booking.artisan && (
                          <UserCircle2 className={cn("h-2.5 w-2.5", booking.status === 'confirmed' ? "text-primary-foreground" : "text-primary")} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}