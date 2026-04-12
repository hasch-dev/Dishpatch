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
  dietary_restrictions: string
  budget: number
  location_address: string
  status: string
  user_id: string
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
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)
        const userType =
          (user.user_metadata?.user_type as 'user' | 'chef') || 'user'
        setUserType(userType)

        // Fetch booking
        const bookingResponse = await fetch(`/api/bookings?bookingId=${bookingId}`)
        if (!bookingResponse.ok) throw new Error('Failed to fetch booking')
        const { data: bookingData } = await bookingResponse.json()
        setBooking(bookingData)

        // Fetch proposals
        const proposalsResponse = await fetch(
          `/api/proposals?bookingId=${bookingId}`
        )
        if (!proposalsResponse.ok) throw new Error('Failed to fetch proposals')
        const { data: proposalsData } = await proposalsResponse.json()
        setProposals(proposalsData || [])
      } catch (err) {
        console.error('Error loading data:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load booking details'
        )
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
        body: JSON.stringify({
          bookingId,
          proposalId: proposal.id,
          chefId: proposal.chef_id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to lock deal')
      }

      // Refresh booking
      const bookingResponse = await fetch(`/api/bookings?bookingId=${bookingId}`)
      const { data: bookingData } = await bookingResponse.json()
      setBooking(bookingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock deal')
    } finally {
      setIsSaving(false)
    }
  }


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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit proposal')
      }

      // Refresh proposals
      const proposalsResponse = await fetch(
        `/api/proposals?bookingId=${bookingId}`
      )
      const { data: proposalsData } = await proposalsResponse.json()
      setProposals(proposalsData || [])

      setShowProposalForm(false)
      setProposalForm({
        proposed_price: '',
        menu_description: '',
        availability_notes: '',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit proposal'
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    )
  }

  const isOwnBooking = userType === 'user' && user?.id === booking.user_id
  const hasProposed = proposals.some((p) => p.chef_id === user?.id)

  return (
    <div className="min-h-svh bg-background py-8 px-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Booking Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{booking.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Status: {booking.status}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p>{booking.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Date & Time
                    </p>
                    <p>
                      {booking.event_date} {booking.event_time && `@ ${booking.event_time}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Guest Count
                    </p>
                    <p>{booking.guest_count} guests</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Location
                    </p>
                    <p>{booking.location_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Budget
                    </p>
                    <p>
                      {booking.budget ? `$${booking.budget.toFixed(2)}` : 'Not specified'}
                    </p>
                  </div>
                </div>

                {booking.dietary_restrictions && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Dietary Restrictions
                    </p>
                    <p>{booking.dietary_restrictions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Proposals ({proposals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No proposals yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {proposal.chef.display_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {proposal.status}
                            </p>
                          </div>
                          <p className="text-lg font-bold">
                            ${proposal.proposed_price.toFixed(2)}
                          </p>
                        </div>
                        {proposal.menu_description && (
                          <p className="text-sm">{proposal.menu_description}</p>
                        )}
                        {proposal.availability_notes && (
                          <p className="text-sm text-muted-foreground">
                            Notes: {proposal.availability_notes}
                          </p>
                        )}
                        {isOwnBooking && proposal.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptProposal(proposal)}
                            >
                              Accept & Lock Deal
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chef Proposal Form */}
          {userType === 'chef' && !isOwnBooking && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {hasProposed ? 'Your Proposal' : 'Submit a Proposal'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasProposed ? (
                    <div className="space-y-4">
                      {!showProposalForm ? (
                        <Button
                          onClick={() => setShowProposalForm(true)}
                          className="w-full"
                        >
                          Create Proposal
                        </Button>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="price">Proposed Price ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={proposalForm.proposed_price}
                              onChange={(e) =>
                                setProposalForm({
                                  ...proposalForm,
                                  proposed_price: e.target.value,
                                })
                              }
                              placeholder="0.00"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="menu">Menu Description</Label>
                            <textarea
                              id="menu"
                              value={proposalForm.menu_description}
                              onChange={(e) =>
                                setProposalForm({
                                  ...proposalForm,
                                  menu_description: e.target.value,
                                })
                              }
                              placeholder="Describe your proposed menu"
                              className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                              id="notes"
                              value={proposalForm.availability_notes}
                              onChange={(e) =>
                                setProposalForm({
                                  ...proposalForm,
                                  availability_notes: e.target.value,
                                })
                              }
                              placeholder="Any availability or other notes"
                              className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>

                          {error && (
                            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
                              {error}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSubmitProposal}
                              disabled={isSaving}
                              className="flex-1"
                              size="sm"
                            >
                              {isSaving ? 'Submitting...' : 'Submit'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowProposalForm(false)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You have submitted a proposal for this booking.
                    </p>
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
