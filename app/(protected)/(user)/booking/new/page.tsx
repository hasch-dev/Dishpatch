'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChefHat, Sparkles, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from "date-fns"
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

  // DATA STATE
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [locationAddress, setLocationAddress] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [budget, setBudget] = useState('')
  const [extraNotes, setExtraNotes] = useState('')

  useEffect(() => setMounted(true), [])

  const isConsultation = bookingType === 'consultation'

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          title,
          event_date: eventDate ? format(eventDate, 'yyyy-MM-dd') : null,
          guest_count: isConsultation ? 1 : guestCount,
          dietary_restrictions: dietaryRestrictions || null,
          budget: budget ? parseFloat(budget) : null,
          location_address: locationAddress,
          status: 'pending_assignment',
          booking_type: bookingType,
          notes: extraNotes || null,
        })

      if (insertError) throw insertError
      router.push('/user-dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (!bookingType) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground transition-colors duration-500">
        <div className="fixed top-12 left-12">
          <Button variant="ghost" onClick={() => router.push('/user-dashboard')} className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-3 w-3" /> Exit Studio
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">Step I: Initiation</span>
            <h1 className="text-6xl font-serif tracking-tight text-foreground">Choose your path.</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 px-4">
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => setBookingType('event')} 
              className="group relative bg-card border border-border p-10 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center rounded-sm mb-6"><Sparkles className="h-5 w-5" /></div>
              <h3 className="text-2xl font-serif">Culinary Event</h3>
              <p className="text-sm text-muted-foreground font-serif leading-relaxed mt-2">Commission an artisan for a full on-site culinary journey.</p>
              <div className="pt-6 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">Start Commission <ArrowRight className="ml-3 h-3 w-3" /></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => setBookingType('consultation')} 
              className="group relative bg-primary p-10 cursor-pointer shadow-xl transition-all duration-300 text-primary-foreground"
            >
              <div className="h-12 w-12 bg-primary-foreground text-primary flex items-center justify-center rounded-sm mb-6"><ChefHat className="h-5 w-5" /></div>
              <h3 className="text-2xl font-serif">Chef Consultation</h3>
              <p className="text-sm opacity-70 font-serif leading-relaxed mt-2">Engage expert advisory for concept or kitchen development.</p>
              <div className="pt-6 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">Start Advisory <ArrowRight className="ml-3 h-3 w-3" /></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent transition-colors duration-500">
      
      {/* NAVIGATION */}
      <nav className="h-20 px-12 flex items-center justify-between sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <Button variant="ghost" onClick={() => setBookingType(null)} className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-3 w-3" /> Back
        </Button>
        <div className="flex gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-500", step === i ? "w-8 bg-primary" : "w-2 bg-muted")} />
            ))}
        </div>
        <div className="w-24 text-right">
            <span className="text-[10px] font-mono font-bold text-muted-foreground">0{step}/03</span>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full pt-16 pb-40 px-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -10 }} 
            className="space-y-12"
          >
            <div className="space-y-2">
                <h2 className="text-4xl font-serif text-foreground tracking-tight">
                    {step === 1 && "Core Foundation"}
                    {step === 2 && "Dossier Specs"}
                    {step === 3 && "Final Directive"}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Step 0{step} Engagement Details</p>
            </div>

            <div className="space-y-10">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-10 px-1">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Dossier Title</Label>
                    <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="bg-muted/30 border-border focus:bg-card focus:border-primary h-14 px-6 text-xl rounded-none transition-all placeholder:text-muted-foreground/30" 
                        placeholder="Untitled Engagement" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Target Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal bg-muted/30 border-border hover:bg-card hover:border-primary h-14 px-6 rounded-none transition-all",
                                !eventDate && "text-muted-foreground/30"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                              <span className="uppercase text-[11px] font-bold tracking-widest">
                                {eventDate ? format(eventDate, "PPP") : "Select Date"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-none border-border bg-card shadow-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={eventDate}
                              onSelect={setEventDate}
                              captionLayout="dropdown"
                              fromYear={2024}
                              toYear={2030}
                              className="rounded-none border-none bg-card text-foreground"
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Location</Label>
                        <Input 
                            value={locationAddress} 
                            onChange={(e) => setLocationAddress(e.target.value)} 
                            className="bg-muted/30 border-border focus:bg-card focus:border-primary h-14 px-6 text-lg rounded-none transition-all placeholder:text-muted-foreground/30" 
                            placeholder="Venue / City" 
                        />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-10 px-1">
                    {!isConsultation && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Guest Count</Label>
                                <Input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="bg-muted/30 border-border focus:bg-card focus:border-primary h-14 px-6 text-lg rounded-none" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Budget ($)</Label>
                                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-muted/30 border-border focus:bg-card focus:border-primary h-14 px-6 text-lg rounded-none placeholder:text-muted-foreground/30" placeholder="0.00" />
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Dietary Nuances</Label>
                        <Input value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} className="bg-muted/30 border-border focus:bg-card focus:border-primary h-14 px-6 text-lg rounded-none placeholder:text-muted-foreground/30" placeholder="List allergies or preferences..." />
                    </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-3 px-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1 text-center block mb-4">Creative Brief</Label>
                    <textarea 
                        value={extraNotes} 
                        onChange={(e) => setExtraNotes(e.target.value)} 
                        className="w-full bg-muted/30 border border-border focus:bg-card focus:border-primary p-8 text-xl min-h-[350px] outline-none leading-relaxed transition-all placeholder:text-muted-foreground/20 text-foreground" 
                        placeholder="Describe your vision..." 
                    />
                </div>
              )}
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-destructive text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full border-t border-border bg-background p-8 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-4">
          <Button 
            variant="ghost" 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1} 
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all"
          >
            Previous
          </Button>
          
          <Button 
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()} 
            disabled={loading} 
            className="bg-primary text-primary-foreground rounded-none h-14 px-12 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-xl disabled:bg-muted"
          >
            {loading ? 'Transmitting...' : step === 3 ? 'Finalize File' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  )
}