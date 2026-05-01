'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChefHat, 
  ArrowLeft, 
  Save, 
  AlertCircle,
  Clock,
  Calendar,
  Info
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function EditBookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [eventDate, setEventDate] = useState('')

  useEffect(() => {
    const fetchDossier = async () => {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !data) {
        setError("Dossier not found or access denied.")
        setLoading(false)
        return
      }

      // Security Check: Revision Limit
      if (data.edit_count >= 2) {
        router.push('/user-dashboard')
        return
      }

      setBooking(data)
      setTitle(data.title || '')
      setNotes(data.notes || '')
      setEventDate(data.event_date || '')
      setLoading(false)
    }

    fetchDossier()
  }, [id, supabase, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          title,
          notes,
          event_date: eventDate,
          // Increment edit_count to track revisions
          edit_count: (booking.edit_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        setError("Failed to synchronize changes with the archive.")
        return
      }

      router.push('/user-dashboard')
      router.refresh() // Invalidate Next.js 16 cache
    })
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="font-serif text-[10px] tracking-[0.5em] animate-pulse opacity-40 uppercase italic">Decrypting_Dossier...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <nav className="h-20 px-12 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-50 border-b border-border/10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push('/user-dashboard')}>
          <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-serif text-xs font-bold uppercase tracking-[0.3em]">Return to Archive</span>
        </div>
        <div className="flex items-center gap-3">
          <ChefHat className="h-4 w-4 text-primary/40" />
          <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.2em]">Revision {(booking?.edit_count || 0) + 1} of 2</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-12 py-20">
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Info className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Modification Suite</p>
          </div>
          <h2 className="text-5xl font-serif italic tracking-tighter leading-none">Revise Commission</h2>
          <p className="text-sm font-serif italic text-muted-foreground">Adjusting directives for record ID: <span className="font-mono text-[10px] opacity-60">#{id?.slice(0, 8)}</span></p>
        </header>

        {error && (
          <div className="mb-8 p-6 bg-destructive/5 border border-destructive/20 flex items-center gap-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-12">
          {/* Section: Core Identity */}
          <section className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Commission Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Solstice Soirée"
                className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 py-6 text-2xl font-serif italic focus-visible:ring-0 focus-visible:border-primary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
                  <Input 
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="rounded-none border-0 border-b border-border/40 bg-transparent pl-8 py-6 text-sm font-serif focus-visible:ring-0 focus-visible:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 opacity-50 cursor-not-allowed">
                <label className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Status (Read-Only)</label>
                <div className="flex items-center gap-3 py-3 border-b border-border/20">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-serif italic uppercase">{booking?.status}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Directives */}
          <section className="space-y-4 pt-8 border-t border-border/10">
            <label className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Creative Directives & Notes</label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide specific instructions for the Artisan..."
              className="min-h-[200px] rounded-none border border-border/40 bg-muted/5 p-6 text-lg font-serif italic leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            />
          </section>

          {/* Action Floor */}
          <footer className="pt-12 flex items-center justify-between">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push('/user-dashboard')}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              Discard Changes
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-none h-14 px-12 bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <span className="animate-pulse">Synchronizing...</span>
              ) : (
                <>
                  <Save className="mr-3 h-4 w-4" /> Update Dossier
                </>
              )}
            </Button>
          </footer>
        </form>

        <div className="mt-20 p-8 border border-primary/10 bg-primary/[0.02] flex gap-6 items-start">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Security Protocol</p>
            <p className="text-xs font-serif italic text-muted-foreground leading-relaxed">
              Updates to this commission are recorded as formal revisions. You have <strong className="text-foreground">{2 - (booking?.edit_count || 0)} revision(s)</strong> remaining before this record is locked for final Artisan preparation.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}