'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NewBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const bookingType = searchParams.get('type') || 'event'
  const isConsultation = bookingType === 'consultation'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ================= BASE FIELDS =================
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')

  // EVENT ONLY
  const [guestCountMin, setGuestCountMin] = useState(1)
  const [guestCountMax, setGuestCountMax] = useState(5)

  // EVENT + FOOD
  const [allergies, setAllergies] = useState('')
  const [ingredientMode, setIngredientMode] = useState<'chef' | 'user'>('chef')

  // CONSULTATION ONLY (UPDATED: single select)
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const [durationValue, setDurationValue] = useState(1)
  const [durationUnit, setDurationUnit] = useState<'day' | 'week' | 'month' | 'custom'>('day')

  const consultationTopics = [
    'Menu planning',
    'Private dining setup',
    'Restaurant concept development',
    'Kitchen workflow optimization',
    'Chef training',
    'Food costing',
    'Catering business advice',
    'Ingredient sourcing',
    'Wine pairing',
    'Nutrition planning',
  ]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      title,
      event_date: eventDate,
      booking_type: bookingType,
      guest_count: isConsultation ? null : null,

      notes: JSON.stringify({
        location,
        allergies,
        ingredientMode: isConsultation ? null : ingredientMode,
        type: bookingType,

        guestRange: isConsultation
          ? null
          : { min: guestCountMin, max: guestCountMax },

        consultation: isConsultation
          ? {
              topic: selectedTopic, // ✅ SINGLE VALUE NOW
              duration: {
                value: durationValue,
                unit: durationUnit,
              },
            }
          : null,
      }),

      status: 'pending_assignment',
      chef_id: null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/user-dashboard')
  }

  const StepCircle = ({
    number,
    active,
    done,
  }: {
    number: number
    active: boolean
    done: boolean
  }) => (
    <div
      className={`
        w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
        transition-all
        ${
          done
            ? 'bg-orange-500 text-white'
            : active
            ? 'bg-orange-500 text-white ring-4 ring-orange-200'
            : 'bg-gray-200 text-gray-500'
        }
      `}
    >
      {number}
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col bg-white">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <Button variant="outline" className='cursor-pointer' onClick={() => router.push('/user-dashboard')}>
          Back to Dashboard
        </Button>

        <div className="text-sm text-muted-foreground">
          {isConsultation ? 'Consultation Booking' : 'Event Booking'}
        </div>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex justify-center items-center gap-6 py-6">
        <StepCircle number={1} active={step === 1} done={step > 1} />
        <div className="w-8 h-1 bg-gray-200" />
        <StepCircle number={2} active={step === 2} done={step > 2} />
        <div className="w-8 h-1 bg-gray-200" />
        <StepCircle number={3} active={step === 3} done={false} />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-2xl space-y-10">

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-8">

              <div className="text-center">
                <h1 className="text-3xl font-bold">
                  {isConsultation ? 'Book a Consultation' : 'Plan your event'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Tell us the basics
                </p>
              </div>

              <div className="space-y-5">

                <div className="space-y-2">
                  <Label>{isConsultation ? 'Session Title' : 'Event Title'}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>

                {!isConsultation && (
                  <div className="space-y-2">
                    <Label>Guests</Label>
                    <div className="flex flex-row gap-4 items-center justify-center">
                      <Input type="number" value={guestCountMin} onChange={(e) => setGuestCountMin(Number(e.target.value))} />
                      <p>to</p>
                      <Input type="number" value={guestCountMax} onChange={(e) => setGuestCountMax(Number(e.target.value))} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-orange-500 text-white cursor-pointer">
                  Continue
                </Button>
              </div>

            </div>
          )}

          {/* ================= STEP 2 (EVENT) ================= */}
          {!isConsultation && step === 2 && (
            <div className="space-y-10">

              <div className="text-center">
                <h1 className="text-3xl font-bold">Preferences</h1>
                <p className="text-muted-foreground mt-2">
                  Help us tailor your dining experience
                </p>
              </div>

              <div className="space-y-4">

                <Label>Allergies</Label>

                <Input
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. peanuts, shellfish..."
                />

              </div>

              <div className="space-y-4">

                <Label>Ingredient Choice</Label>

                <div className="flex gap-4">

                  <div
                    onClick={() => setIngredientMode('chef')}
                    className={`flex-1 cursor-pointer border rounded-xl p-5 ${
                      ingredientMode === 'chef'
                        ? 'border-orange-500 bg-orange-50'
                        : ''
                    }`}
                  >
                    <h3 className="font-semibold">Chef chooses 👍</h3>
                    <p className="text-sm text-muted-foreground">
                      Let the chef design the menu
                    </p>
                  </div>

                  <div
                    onClick={() => setIngredientMode('user')}
                    className={`flex-1 cursor-pointer border rounded-xl p-5 ${
                      ingredientMode === 'user'
                        ? 'border-orange-500 bg-orange-50'
                        : ''
                    }`}
                  >
                    <h3 className="font-semibold">I choose</h3>
                    <p className="text-sm text-muted-foreground">
                      Full control over ingredients
                    </p>
                  </div>

                </div>

              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="bg-orange-500 text-white cursor-pointer">
                  Continue
                </Button>
              </div>

            </div>
          )}

          {/* ================= STEP 2 (CONSULTATION FIXED) ================= */}
          {isConsultation && step === 2 && (
            <div className="space-y-12">

              {/* HEADER */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  What do you need help with?
                </h1>
                <p className="text-muted-foreground">
                  Choose one focus so we can match you with the right chef consultant
                </p>
              </div>

              {/* TOPIC GRID */}
              <div className="grid grid-cols-2 gap-4">

                {consultationTopics.map((topic) => {
                  const isActive = selectedTopic === topic

                  return (
                    <div
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`
                        cursor-pointer rounded-2xl border p-5 transition-all
                        hover:-translate-y-0.5 hover:shadow-md
                        active:scale-[0.99]
                        ${
                          isActive
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-orange-200 bg-white'
                        }
                      `}
                    >
                      <div className="space-y-2">

                        <div className="flex items-start justify-between gap-3">

                          <p className="text-sm font-semibold leading-snug">
                            {topic}
                          </p>

                          {isActive && (
                            <span className="text-orange-500 text-xs font-semibold">
                              Selected
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">

                          {topic === 'Menu planning' &&
                            'Build structured menus tailored to events, guests, or restaurant concepts.'}

                          {topic === 'Private dining setup' &&
                            'Design high-end private dining experiences from setup to execution.'}

                          {topic === 'Restaurant concept development' &&
                            'Create a strong identity, direction, and strategy for your restaurant.'}

                          {topic === 'Kitchen workflow optimization' &&
                            'Improve speed, efficiency, and organization inside your kitchen.'}

                          {topic === 'Chef training' &&
                            'Train chefs on techniques, consistency, plating, and kitchen discipline.'}

                          {topic === 'Food costing' &&
                            'Understand pricing, margins, and cost control for profitability.'}

                          {topic === 'Catering business advice' &&
                            'Scale or launch a catering business with proper systems and structure.'}

                          {topic === 'Ingredient sourcing' &&
                            'Find better suppliers and improve ingredient quality and consistency.'}

                          {topic === 'Wine pairing' &&
                            'Match dishes with wines to elevate dining experiences.'}

                          {topic === 'Nutrition planning' &&
                            'Design balanced menus aligned with dietary and health goals.'}

                        </p>
                      </div>
                    </div>
                  )
                })}

              </div>

              {/* DURATION MODULE */}
              <div className="border rounded-2xl p-6 bg-white space-y-5">

                <div>
                  <h3 className="font-semibold text-base">Consultation duration</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 1 unit required — scale up depending on your project complexity
                  </p>
                </div>

                <div className="flex gap-3 items-center">

                  <Input
                    type="number"
                    min={1}
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="h-11 w-24"
                  />

                  <select
                    className="h-11 border rounded-lg px-3 bg-white"
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value as any)}
                  >
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                    <option value="month">Months</option>
                    <option value="custom">Custom</option>
                  </select>

                </div>

              </div>

              {/* NAV */}
              <div className="flex justify-between pt-2">

                <Button variant="outline" onClick={() => setStep(1)} className='cursor-pointer'>
                  Back
                </Button>

                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedTopic}
                  className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                >
                  Continue
                </Button>

              </div>

            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-8">

              <div className="text-center">
                <h1 className="text-3xl font-bold">Review</h1>
              </div>

              <div className="border rounded-xl p-6 space-y-2">

                <p><strong>Type:</strong> {bookingType}</p>
                <p><strong>Title:</strong> {title}</p>
                <p><strong>Date:</strong> {eventDate}</p>
                <p><strong>Location:</strong> {location}</p>

                {!isConsultation ? (
                  <>
                    <p><strong>Guests:</strong> {guestCountMin} - {guestCountMax}</p>
                    <p><strong>Ingredient Mode:</strong> {ingredientMode}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Topic:</strong> {selectedTopic}</p>
                    <p><strong>Duration:</strong> {durationValue} {durationUnit}</p>
                  </>
                )}

              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-orange-500 text-white cursor-pointer">
                  {loading ? 'Creating...' : 'Confirm Booking'}
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  )
}