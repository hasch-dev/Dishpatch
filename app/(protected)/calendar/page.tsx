"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  date: string 
  time: string
  title: string
  status: string
  user_id: string // Client ID
  chef_id: string // Chef ID
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
  const [role, setRole] = React.useState<"chef" | "user" | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  React.useEffect(() => {
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
      setRole(userRole)

      let query = supabase.from("bookings").select("*")

      if (userRole === "chef") {
        query = query.eq("chef_id", user.id).eq("status", "accepted")
      } else {
        query = query.eq("user_id", user.id)
      }

      const { data: fetchedBookings, error } = await query

      if (!error && fetchedBookings) {
        setBookings(fetchedBookings)
      }
      
      setIsLoading(false)
    }

    fetchCalendarData()
  }, [supabase])

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
  const prevMonthPadding = Array.from({ length: firstDayOfMonth }).map((_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    isCurrentMonth: false,
    dateString: null
  }))

  const currentMonthDays = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1
    const monthStr = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return {
      day,
      isCurrentMonth: true,
      dateString: `${currentYear}-${monthStr}-${dayStr}`
    }
  })

  const totalCellsSoFar = prevMonthPadding.length + currentMonthDays.length
  const nextMonthPadding = Array.from({ length: Math.ceil(totalCellsSoFar / 7) * 7 - totalCellsSoFar }).map((_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    dateString: null
  }))

  const calendarCells = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding]

  const isToday = (day: number, isCurrentMonth: boolean) => {
    const today = new Date()
    return isCurrentMonth && 
           day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear()
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <p className="text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Schedule...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background p-8">
      
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif italic text-foreground tracking-tight">
            {MONTHS[currentMonth]} <span className="text-primary not-italic">{currentYear}</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-1 w-8 bg-primary" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
              {role === 'chef' ? 'Kitchen Schedule' : 'Your Reservations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToToday} 
            className="text-[10px] uppercase tracking-widest font-bold border border-border rounded-none hover:bg-primary hover:text-primary-foreground"
          >
            Today
          </Button>
          <div className="flex items-center bg-muted/20 border border-border">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-primary/10" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-border" />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-primary/10" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col border border-border shadow-2xl bg-card overflow-hidden">
        
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-4 text-center text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 bg-border gap-px h-full">
          {calendarCells.map((cell, idx) => {
            // FIXED: Using optional chaining ?. and String() cast for safety
            const dayBookings = cell.isCurrentMonth && cell.dateString
              ? bookings.filter(b => b.date?.toString().startsWith(cell.dateString as string))
              : []

            return (
              <div 
                key={idx} 
                className={cn(
                  "relative min-h-[140px] bg-background p-3 flex flex-col gap-2 transition-all duration-300 group",
                  !cell.isCurrentMonth && "bg-muted/5 opacity-30 pointer-events-none"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-xs font-bold font-serif transition-all duration-300",
                    isToday(cell.day, cell.isCurrentMonth) 
                      ? "bg-primary text-primary-foreground h-7 w-7 flex items-center justify-center rounded-none italic" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {cell.day}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
                  {dayBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="flex flex-col p-2 bg-muted/40 border-l-2 border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] font-serif italic font-bold text-foreground leading-tight truncate">
                        {booking.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-tighter text-muted-foreground mt-1 font-bold">
                        <Clock className="h-2.5 w-2.5 text-primary" />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 pointer-events-none transition-colors" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}