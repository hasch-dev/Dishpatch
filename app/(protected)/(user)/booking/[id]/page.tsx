'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  guest_count: number
  duration: string
  occasion: string
  allergies: string[]
  custom_allergy: string
  budget_min: number
  budget_max: number
  location_city: string
  location_address: string
  status: string
  user_id: string
  service_package?: string
  consultation_topic?: string
  consultation_type?: string
  menu_selections?: string[]
  custom_menu?: string
  booking_type?: string
}

interface Proposal {
  id: string
  chef_id: string
  proposed_price: number
  menu_description: string
  availability_notes: string
  status: string
  chef: {
    display_name: string
    avatar_url: string
  }
}

export default function BookingDetailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'user' | 'chef' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalForm, setProposalForm] = useState({
    proposed_price: '',
    menu_description: '',
    availability_notes: '',
  })

  const params = useParams()
  const bookingId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)
        const userType = (user.user_metadata?.user_type as 'user' | 'chef') || 'user'
        setUserType(userType)

        const bookingResponse = await fetch(`/api/bookings?bookingId=${bookingId}`)
        if (!bookingResponse.ok) throw new Error('Failed to fetch booking')
        const { data: bookingData } = await bookingResponse.json()
        setBooking(bookingData)

        const proposalsResponse = await fetch(`/api/proposals?bookingId=${bookingId}`)
        if (!proposalsResponse.ok) throw new Error('Failed to fetch proposals')
        const { data: proposalsData } = await proposalsResponse.json()
        setProposals(proposalsData || [])
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load booking details')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [bookingId, supabase, router])

  const handleAcceptProposal = async (proposal: Proposal) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, proposalId: proposal.id, chefId: proposal.chef_id }),
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to lock deal')
      const bookingResponse = await fetch(`/api/bookings?bookingId=${bookingId}`)
      const { data: bookingData } = await bookingResponse.json()
      setBooking(bookingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock deal')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitProposal = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          proposed_price: parseFloat(proposalForm.proposed_price),
          menu_description: proposalForm.menu_description,
          availability_notes: proposalForm.availability_notes,
        }),
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to submit proposal')
      const proposalsResponse = await fetch(`/api/proposals?bookingId=${bookingId}`)
      const { data: proposalsData } = await proposalsResponse.json()
      setProposals(proposalsData || [])
      setShowProposalForm(false)
      setProposalForm({ proposed_price: '', menu_description: '', availability_notes: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proposal')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="flex min-h-svh items-center justify-center"><p>Loading...</p></div>
  if (!booking) return <div className="flex min-h-svh items-center justify-center"><p>Booking not found</p></div>

  const isOwnBooking = userType === 'user' && user?.id === booking.user_id
  const hasProposed = proposals.some((p) => p.chef_id === user?.id)

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="min-h-svh bg-background py-8 px-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 rounded-none">Back</Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            
            <Card className="border-none shadow-none bg-muted/20 rounded-none">
              <CardHeader className="border-b border-border/50 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-1">
                      {booking.booking_type || 'Booking'} Report
                    </p>
                    <CardTitle className="text-3xl font-serif italic">{booking.title}</CardTitle>
                  </div>
                  <div className="bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                    {booking.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <SummaryDetail label="Service Tier" value={booking.service_package || "Standard"} />
                  <SummaryDetail label="Start Date" value={booking.event_date} />
                  <SummaryDetail label="City" value={booking.location_city || "TBD"} />
                  <SummaryDetail label="Address" value={booking.location_address || "TBD"} />
                  
                  {booking.booking_type === 'Consultation' ? (
                    <>
                      <SummaryDetail label="Current Phase" value={booking.consultation_type || "N/A"} />
                      <SummaryDetail label="Topic" value={booking.consultation_topic || "N/A"} />
                    </>
                  ) : (
                    <>
                      <SummaryDetail label="Time & Duration" value={`${formatTime(booking.event_time)} (${booking.duration || 'N/A'})`} />
                      <SummaryDetail label="Occasion" value={booking.occasion || "N/A"} />
                      <SummaryDetail label="Guests" value={`${booking.guest_count} persons`} />
                      <SummaryDetail label="Budget Range" value={`₱${booking.budget_min?.toLocaleString()} - ₱${booking.budget_max?.toLocaleString()}`} />
                    </>
                  )}
                </div>

                {booking.booking_type === 'Private Event' && (
                  <div className="pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Menu Cart & Ideas</p>
                      <ul className="list-disc list-inside font-serif italic">
                        {booking.menu_selections && booking.menu_selections.length > 0 ? (
                          booking.menu_selections.map(m => <li key={m}>{m}</li>)
                        ) : (
                          <li className="text-muted-foreground">No specific items selected</li>
                        )}
                      </ul>
                      {booking.custom_menu && <p className="mt-2 text-sm">"{booking.custom_menu}"</p>}
                    </div>

                    {booking.allergies && booking.allergies.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Allergies</p>
                        <p className="font-serif italic text-red-600/80">
                          {booking.allergies.join(", ")}
                          {booking.custom_allergy && ` (${booking.custom_allergy})`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {booking.description && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Client Notes</p>
                    <p className="text-sm leading-relaxed">{booking.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="font-serif italic text-2xl">Proposals ({proposals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">No proposals yet.</p>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="border border-border/50 p-4 space-y-3 bg-card hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{proposal.chef.display_name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Status: {proposal.status}</p>
                          </div>
                          <p className="text-xl font-serif italic text-primary">₱{proposal.proposed_price.toLocaleString()}</p>
                        </div>
                        {proposal.menu_description && <p className="text-sm border-l-2 border-primary/20 pl-3 italic text-muted-foreground">"{proposal.menu_description}"</p>}
                        {proposal.availability_notes && <p className="text-xs text-muted-foreground"><span className="font-bold">Notes:</span> {proposal.availability_notes}</p>}
                        {isOwnBooking && proposal.status === 'pending' && (
                          <div className="flex gap-2 pt-4">
                            <Button size="sm" onClick={() => handleAcceptProposal(proposal)} className="rounded-none w-full bg-primary hover:bg-primary/90 text-white">Accept & Lock Deal</Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {userType === 'chef' && !isOwnBooking && (
            <div>
              <Card className="rounded-none border-primary bg-primary/5 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg font-serif italic text-primary">{hasProposed ? 'Your Proposal' : 'Submit a Proposal'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasProposed ? (
                    <div className="space-y-4">
                      {!showProposalForm ? (
                        <Button onClick={() => setShowProposalForm(true)} className="w-full rounded-none">Create Proposal</Button>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="price" className="text-xs uppercase tracking-widest font-bold">Proposed Price (₱)</Label>
                            <Input id="price" type="number" min="0" value={proposalForm.proposed_price} onChange={(e) => setProposalForm({...proposalForm, proposed_price: e.target.value})} placeholder="0.00" className="rounded-none border-primary/30" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="menu" className="text-xs uppercase tracking-widest font-bold">Menu Concept / Plan</Label>
                            <textarea id="menu" value={proposalForm.menu_description} onChange={(e) => setProposalForm({...proposalForm, menu_description: e.target.value})} placeholder="Describe your vision or timeline" className="min-h-24 rounded-none border border-primary/30 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notes" className="text-xs uppercase tracking-widest font-bold">Notes</Label>
                            <textarea id="notes" value={proposalForm.availability_notes} onChange={(e) => setProposalForm({...proposalForm, availability_notes: e.target.value})} placeholder="Any requirements or availability notes" className="min-h-16 rounded-none border border-primary/30 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                          </div>
                          {error && <div className="bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</div>}
                          <div className="flex gap-2 pt-2">
                            <Button onClick={handleSubmitProposal} disabled={isSaving} className="flex-1 rounded-none text-xs bg-primary text-white">{isSaving ? 'Submitting...' : 'Submit'}</Button>
                            <Button variant="outline" onClick={() => setShowProposalForm(false)} className="rounded-none text-xs">Cancel</Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">You have already submitted a proposal for this request.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryDetail({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</p>
      <p className="text-sm font-semibold truncate" title={String(value)}>{value}</p>
    </div>
  )
}