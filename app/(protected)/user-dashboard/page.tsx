'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Chef {
  id: string
  display_name: string
  avatar_url: string
  location_address: string
  chef_details: any[]
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [chefs, setChefs] = useState<Chef[]>([])
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [searchCuisine, setSearchCuisine] = useState('')
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

      setUserType(type)
      setUser(user)

      // ✅ Redirect chefs immediately
      if (type === 'chef') {
        router.push('/chef-dashboard')
        return
      }

      await fetchChefs()

      // ✅ FIX: pass user_id
      const response = await fetch(`/api/bookings?user_id=${user.id}`)
      if (response.ok) {
        const { data } = await response.json()
        setUserBookings(data || [])
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const fetchChefs = async (cuisine?: string) => {
    const params = new URLSearchParams()
    if (cuisine) params.append('cuisine', cuisine)

    const response = await fetch(`/api/chefs?${params}`)
    const { data } = await response.json()
    setChefs(data || [])
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchChefs(searchCuisine)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (isLoading) {
    return <div className="flex min-h-svh items-center justify-center">Loading...</div>
  }

  if (userType === 'chef') {
    return (
      <div className="min-h-svh bg-background">
        <header className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dishpatch - Chef Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {user?.user_metadata?.display_name}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Chef dashboard coming soon. You&apos;ll manage bookings, proposals, and your profile here.
              </p>
              <Link href="/profile">
                <Button>Complete Your Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dishpatch</h1>
            <p className="text-muted-foreground">Find your perfect private chef</p>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Browse Chefs</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by cuisine type..."
              value={searchCuisine}
              onChange={(e) => setSearchCuisine(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chefs.map((chef) => (
            <Card key={chef.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4">
                  {chef.avatar_url && (
                    <img
                      src={chef.avatar_url}
                      alt={chef.display_name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    ></img>
                  )}
                  <h3 className="text-lg font-semibold">{chef.display_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {chef.location_address}
                  </p>
                </div>

                {chef.chef_details[0] && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">
                        {chef.chef_details[0].experience_years} years
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">
                        {chef.chef_details[0].rating.toFixed(1)} ⭐
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">
                        ${chef.chef_details[0].session_rate}/session
                      </span>
                    </div>
                    {chef.chef_details[0].cuisine_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {chef.chef_details[0].cuisine_types.slice(0, 3).map((cuisine) => (
                          <span
                            key={cuisine}
                            className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Link href={`/chef/${chef.id}`}>
                  <Button className="w-full">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {chefs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No chefs found</p>
            <Button onClick={() => fetchChefs()}>Show All Chefs</Button>
          </div>
        )}

        {userBookings.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Link href="/booking/new">
                <Button>Create New Booking</Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {userBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">{booking.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>Date: {booking.event_date}</p>
                      <p>Guests: {booking.guest_count}</p>
                      <p>Status: <span className="font-medium capitalize">{booking.status}</span></p>
                    </div>
                    <Link href={`/booking/${booking.id}`}>
                      <Button className="w-full" size="sm">View Booking</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
