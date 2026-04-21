'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
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
  const [user, setUser] = useState<any>(null)
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [userType, setUserType] = useState<'user' | 'chef' | null>(null)

  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      const type = profile?.user_type || 'user'

      setUser(user)
      setUserType(type)

      if (type === 'chef') {
        router.push('/chef-dashboard')
        return
      }

      const response = await fetch(`/api/bookings?user_id=${user.id}`)
      if (response.ok) {
        const { data } = await response.json()
        setUserBookings(data || [])
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">

      {/* HEADER */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dishpatch</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.user_metadata?.display_name}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline">My Profile</Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-8">

        {/* HEADER + CTA */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <p className="text-muted-foreground">
              Create a booking and we’ll assign a chef for you
            </p>
          </div>

          <Button
            onClick={() => setShowBookingTypeModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            + Create Booking
          </Button>
        </div>

        {/* BOOKINGS */}
        {userBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don’t have any bookings yet.
              </p>
              <Button onClick={() => setShowBookingTypeModal(true)}>
                Create your first booking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {userBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">

                  <h3 className="font-semibold text-lg mb-2">
                    {booking.title}
                  </h3>

                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p>Date: {booking.event_date}</p>
                    <p>Guests: {booking.guest_count}</p>
                    <p>
                      Status:{' '}
                      <span className="font-medium capitalize">
                        {booking.status === 'pending_assignment'
                          ? 'Waiting for chef assignment'
                          : booking.status}
                      </span>
                    </p>
                  </div>

                  <Link href={`/booking/${booking.id}`}>
                    <Button className="w-full" size="sm">
                      View Booking
                    </Button>
                  </Link>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* ================= MODAL ================= */}
      {showBookingTypeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl w-[70%] min-h-[75%] p-8 flex flex-col shadow-2xl relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowBookingTypeModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            >
              ✕
            </button>

            {/* HEADER */}
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-3xl font-bold">What are you booking?</h2>
              <p className="text-muted-foreground">
                Choose your experience type
              </p>
            </div>

            {/* CARDS */}
            <div className="flex flex-1 gap-8 items-stretch">

              {/* EVENT CARD */}
              <div
                onClick={() => router.push('/booking/new?type=event')}
                className="flex-1 cursor-pointer border rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-500 transition-all group flex flex-col bg-white"
              >

                {/* IMAGE PLACEHOLDER (NO GRADIENT) */}
                <div className="h-[65%] min-h-[260px] bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500 text-5xl font-semibold">
                    🍽
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-2 flex-1">
                  <h3 className="text-2xl font-semibold group-hover:text-orange-500 transition">
                    Private Event
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dinner parties, celebrations, corporate gatherings, and curated private chef experiences tailored for your event.
                  </p>
                </div>

              </div>

              {/* CONSULTATION CARD */}
              <div
                onClick={() => router.push('/booking/new?type=consultation')}
                className="flex-1 cursor-pointer border rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-500 transition-all group flex flex-col bg-white"
              >

                {/* IMAGE PLACEHOLDER (NO GRADIENT) */}
                <div className="h-[65%] min-h-[260px] bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-500 text-5xl font-semibold">
                    🧑‍🍳
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-2 flex-1">
                  <h3 className="text-2xl font-semibold group-hover:text-orange-500 transition">
                    Chef Consultation
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get expert help planning menus, improving cooking skills, or designing a personalized food experience with a professional chef.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}