'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChefHat, Sparkles, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, addMonths, isBefore, startOfToday, isSameDay, parseISO } from "date-fns"
import { motion, AnimatePresence } from 'framer-motion'

export default function NewBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [bookingType, setBookingType] = useState<'event' | 'consultation' | null>(
    (searchParams.get('type') as 'event' | 'consultation') || null
  )

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [assignedDates, setAssignedDates] = useState<Date[]>([])
  const [pendingDates, setPendingDates] = useState<Date[]>([])
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // DATA STATE
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [locationAddress, setLocationAddress] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [budget, setBudget] = useState('')
  const [extraNotes, setExtraNotes] = useState('')

  const today = startOfToday()
  const maxBookingDate = addMonths(today, 1)
  const BUFFER_DAYS = 2

  useEffect(() => {
    setMounted(true)
    const fetchAvailability = async () => {
      const { data } = await supabase.from('bookings').select('event_date, chef_id')
      if (data) {
        setAssignedDates(data.filter(b => b.chef_id !== null).map(b => parseISO(b.event_date)))
        setPendingDates(data.filter(b => b.chef_id === null).map(b => parseISO(b.event_date)))
      }
    }
    fetchAvailability()
  }, [supabase])

  const isDateBlockedByBuffer = (date: Date) => {
    return assignedDates.some(ad => {
      const start = addDays(ad, -BUFFER_DAYS)
      const end = addDays(ad, BUFFER_DAYS)
      return date >= start && date <= end
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        title,
        event_date: eventDate ? format(eventDate, 'yyyy-MM-dd') : null,
        guest_count: bookingType === 'consultation' ? 1 : guestCount,
        dietary_restrictions: dietaryRestrictions || null,
        budget: budget ? parseFloat(budget) : null,
        location_address: locationAddress,
        status: 'pending_assignment',
        booking_type: bookingType,
        notes: extraNotes || null,
        edit_count: 0
      })

      if (error) throw error
      router.push('/user-dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  // Selection Screen (Path Choice)
  if (!bookingType) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 transition-colors duration-500">
        <div className="fixed top-12 left-12">
          <Button variant="ghost" onClick={() => router.push('/user-dashboard')} className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            <ArrowLeft className="mr-2 h-3 w-3" /> Exit Studio
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full space-y-16 text-center">
          <h1 className="text-6xl font-serif tracking-tight">Choose your path.</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div onClick={() => setBookingType('event')} className="bg-card border border-border p-10 cursor-pointer hover:shadow-2xl transition-all group">
              <Sparkles className="h-8 w-8 mb-4 text-primary" />
              <h3 className="text-2xl font-serif">Culinary Event</h3>
              <p className="text-sm text-muted-foreground mt-2">Commission for on-site journey.</p>
            </div>
            <div onClick={() => setBookingType('consultation')} className="bg-primary text-primary-foreground p-10 cursor-pointer hover:shadow-2xl transition-all">
              <ChefHat className="h-8 w-8 mb-4" />
              <h3 className="text-2xl font-serif">Advisory</h3>
              <p className="text-sm opacity-70 mt-2">Expert kitchen development.</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="h-20 px-12 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <Button variant="ghost" onClick={() => setBookingType(null)} className="text-[9px] uppercase tracking-widest"><ArrowLeft className="mr-2 h-3 w-3" /> Back</Button>
        <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className={cn("h-1 transition-all duration-500", step === i ? "w-8 bg-primary" : "w-2 bg-muted")} />)}
        </div>
        <span className="text-[10px] font-mono">0{step}/03</span>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full pt-16 pb-40 px-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-12">
            <h2 className="text-4xl font-serif tracking-tight">
                {step === 1 && "Core Foundation"}
                {step === 2 && "Dossier Specs"}
                {step === 3 && "Final Directive"}
            </h2>

            <div className="space-y-10">
              {step === 1 && (
                <div className="space-y-10">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-14 text-xl rounded-none bg-muted/20" placeholder="Engagement Title" />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-none bg-muted/20 border-border">
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {eventDate ? format(eventDate, "PPP") : "Select Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-none border-border" align="start">
                          <Calendar
                            mode="single"
                            selected={eventDate}
                            onSelect={setEventDate}
                            disabled={(date) => isBefore(date, today) || date > maxBookingDate || isDateBlockedByBuffer(date)}
                            modifiers={{ 
                                booked: (date) => assignedDates.some(ad => isSameDay(date, ad)),
                                buffer: (date) => isDateBlockedByBuffer(date) && !assignedDates.some(ad => isSameDay(date, ad)),
                                pending: pendingDates,
                                available: (date) => !isBefore(date, today) && date <= maxBookingDate && !isDateBlockedByBuffer(date) && !pendingDates.some(pd => isSameDay(date, pd))
                            }}
                            modifiersClassNames={{
                                booked: "booked-date-style",
                                buffer: "buffer-date-style",
                                pending: "pending-date-style",
                                available: "available-date-style"
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} className="h-14 rounded-none bg-muted/20" placeholder="Location" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-6">
                        <Input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="h-14 bg-muted/20" placeholder="PAX" />
                        <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-14 bg-muted/20" placeholder="Budget ($)" />
                    </div>
                    <Input value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} className="h-14 bg-muted/20" placeholder="Dietary Restrictions" />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10">
                    <textarea value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} className="w-full bg-muted/20 border p-8 min-h-[250px] outline-none" placeholder="Creative Brief..." />
                    <div className="bg-primary/5 p-6 border border-primary/10 flex gap-4 items-start">
                        <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 accent-primary" />
                        <p className="text-[10px] uppercase tracking-widest leading-loose text-muted-foreground italic">
                            I understand that this request initiates a professional review. Once a quote is issued, this engagement is a binding commitment.
                        </p>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 w-full border-t border-border bg-background p-8 z-40">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1} className="uppercase text-[10px] tracking-widest">Previous</Button>
          <Button 
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()} 
            disabled={loading || (step === 3 && !agreedToTerms)} 
            className="rounded-none h-14 px-12 uppercase text-[10px] tracking-[0.3em]"
          >
            {loading ? 'Transmitting...' : step === 3 ? 'Finalize File' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  )
}