'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CreateBookingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<'user' | 'chef' | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    guest_count: 1,
    dietary_restrictions: '',
    budget: '',
    location_address: '',
    location_lat: 0,
    location_lng: 0,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const userType =
          (user.user_metadata?.user_type as 'user' | 'chef') || 'user'

        if (userType !== 'user') {
          router.push('/dashboard')
          return
        }

        setUserType(userType)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          guest_count: parseInt(formData.guest_count),
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      const { data } = await response.json()
      router.push(`/booking/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
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

  if (userType !== 'user') {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">
          Only users can create booking requests
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background py-12 px-4 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Request a Chef</h1>
          <p className="text-muted-foreground">
            Tell chefs about your event and get proposals
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Provide information about your catering event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Birthday party, Wedding, Dinner party, etc."
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell chefs about your event, theme, preferences, etc."
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Event Date */}
              <div className="grid gap-2">
                <Label htmlFor="event-date">Event Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Event Time */}
              <div className="grid gap-2">
                <Label htmlFor="event-time">Event Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) =>
                    setFormData({ ...formData, event_time: e.target.value })
                  }
                />
              </div>

              {/* Guest Count */}
              <div className="grid gap-2">
                <Label htmlFor="guest-count">Number of Guests</Label>
                <Input
                  id="guest-count"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.guest_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guest_count: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              {/* Budget */}
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  placeholder="Leave blank for no specific budget"
                />
              </div>

              {/* Dietary Restrictions */}
              <div className="grid gap-2">
                <Label htmlFor="dietary">Dietary Restrictions</Label>
                <textarea
                  id="dietary"
                  value={formData.dietary_restrictions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dietary_restrictions: e.target.value,
                    })
                  }
                  placeholder="Vegan, gluten-free, allergies, etc."
                  className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location">Event Location</Label>
                <Input
                  id="location"
                  value={formData.location_address}
                  onChange={(e) =>
                    setFormData({ ...formData, location_address: e.target.value })
                  }
                  placeholder="Address or location description"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Creating...' : 'Create Booking Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
