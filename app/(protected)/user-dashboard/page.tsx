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

      // 🚨 redirect chefs
      if (type === 'chef') {
        router.push('/chef-dashboard')
        return
      }

      // 📦 fetch bookings
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

        {/* CREATE BOOKING CTA */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <p className="text-muted-foreground">
              Create a booking and we’ll assign a chef for you
            </p>
          </div>

          <Link href="/booking/new">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              + Create Booking
            </Button>
          </Link>
        </div>

        {/* BOOKINGS LIST */}
        {userBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don’t have any bookings yet.
              </p>
              <Link href="/booking/new">
                <Button>Create your first booking</Button>
              </Link>
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

                  {booking.status === 'assigned' && (
                    <p className="text-green-600 text-sm mb-2">
                      Chef has been assigned 🎉
                    </p>
                  )}

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
    </div>
  )
}