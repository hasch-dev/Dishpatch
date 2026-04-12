'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PhilippinePeso, X } from 'lucide-react'

const CUISINE_OPTIONS = [
  'Italian',
  'Japanese',
  'Filipino',
  'French',
  'Chinese',
  'Korean',
  'Thai',
  'Mediterranean',
  'American',
  'Indian',
]

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<'user' | 'chef'>('user')

  const [searchCuisine, setSearchCuisine] = useState('')

  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    phone: '',
    location_address: '',
  })

  const [chefDetails, setChefDetails] = useState({
    cuisine_types: [] as string[],
    experience_years: 0,
    hourly_rate: 0,
    chef_title: 'Chef',
    offers_consultation: false,
    consultation_rate: 0,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth/login')

      const type =
        (user.user_metadata?.user_type as 'user' | 'chef') || 'user'

      setUserType(type)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      if (type === 'chef') {
        const { data: chefData } = await supabase
          .from('chef_details')
          .select('*')
          .eq('id', user.id)
          .single()

        if (chefData) setChefDetails(chefData)
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          user_type: userType,
          ...(userType === 'chef' && chefDetails),
        }),
      })

      if (!res.ok) throw new Error()

      router.push('/dashboard')
    } catch {
      setError('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCuisineOptions = CUISINE_OPTIONS.filter(
    (c) =>
      c.toLowerCase().includes(searchCuisine.toLowerCase()) &&
      !chefDetails.cuisine_types.includes(c)
  )

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">
            {userType === 'chef'
              ? 'Showcase your experience and pricing'
              : 'Manage your personal details'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="grid lg:grid-cols-[1fr_280px] gap-6"
        >

          {/* MAIN */}
          <div className="space-y-5">

            {/* BASIC INFO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.display_name}
                    onChange={(e) =>
                      setProfile({ ...profile, display_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={profile.location_address}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        location_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Bio</Label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="w-full rounded-md border p-3 text-sm bg-background"
                  />
                </div>

              </CardContent>
            </Card>

            {/* CHEF */}
            {userType === 'chef' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chef Details</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <select
                      className="w-full border rounded-md p-2 bg-background"
                      value={chefDetails.chef_title}
                      onChange={(e) =>
                        setChefDetails({
                          ...chefDetails,
                          chef_title: e.target.value,
                        })
                      }
                    >
                      <option>Chef</option>
                      <option>Sous Chef</option>
                      <option>Head Chef</option>
                      <option>Executive Chef</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      type="number"
                      value={chefDetails.experience_years}
                      onChange={(e) =>
                        setChefDetails({
                          ...chefDetails,
                          experience_years: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* CUISINES */}
                  <div className="md:col-span-2 space-y-2 relative">
                    <Label>Cuisines</Label>

                    {/* SELECTED TAGS */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {chefDetails.cuisine_types.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() =>
                              setChefDetails({
                                ...chefDetails,
                                cuisine_types:
                                  chefDetails.cuisine_types.filter(
                                    (x) => x !== c
                                  ),
                              })
                            }
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <Input
                      placeholder="Search cuisines..."
                      value={searchCuisine}
                      onChange={(e) => setSearchCuisine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault()
                      }}
                    />

                    {/* DROPDOWN */}
                    {searchCuisine && filteredCuisineOptions.length > 0 && (
                      <div className="absolute z-10 w-full border rounded-md bg-background mt-1 shadow-sm max-h-40 overflow-y-auto">
                        {filteredCuisineOptions.map((c) => (
                          <div
                            key={c}
                            className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setChefDetails({
                                ...chefDetails,
                                cuisine_types: [
                                  ...chefDetails.cuisine_types,
                                  c,
                                ],
                              })
                              setSearchCuisine('')
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <div className="flex items-center gap-2">
                      <PhilippinePeso size={16} />
                      <Input
                        type="number"
                        value={chefDetails.hourly_rate}
                        onChange={(e) =>
                          setChefDetails({
                            ...chefDetails,
                            hourly_rate: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* CONSULTATION */}
                  <div className="space-y-2">
                    <Label>Consultation</Label>
                    <select
                      className="w-full border rounded-md p-2 bg-background pr-2"
                      value={chefDetails.offers_consultation ? 'yes' : 'no'}
                      onChange={(e) =>
                        setChefDetails({
                          ...chefDetails,
                          offers_consultation: e.target.value === 'yes',
                        })
                      }
                    >
                      <option value="no">Cooking Only</option>
                      <option value="yes">Cooking + Consultation</option>
                    </select>
                  </div>

                  {chefDetails.offers_consultation && (
                    <div className="space-y-2">
                      <Label>Consultation Rate</Label>
                      <div className="flex items-center gap-2">
                        <PhilippinePeso size={16} />
                        <Input
                          type="number"
                          value={chefDetails.consultation_rate}
                          onChange={(e) =>
                            setChefDetails({
                              ...chefDetails,
                              consultation_rate: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="font-medium capitalize">{userType}</p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

          </div>

        </form>
      </div>
    </div>
  )
}