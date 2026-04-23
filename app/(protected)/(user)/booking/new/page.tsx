'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type BookingType = 'event' | 'consultation'
type DurationUnit = 'day' | 'week' | 'month' | 'custom'

export default function NewBookingPage() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  const bookingType = (searchParams.get('type') as BookingType) || 'event'
  const isConsultation = bookingType === 'consultation'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ================= CORE =================
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationAddress, setLocationAddress] = useState('')

  // EVENT
  const [guestMin, setGuestMin] = useState(1)
  const [guestMax, setGuestMax] = useState(5)
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [ingredientMode, setIngredientMode] = useState<'chef' | 'user'>('chef')

  // CONSULTATION
  const [topic, setTopic] = useState('')
  const [durationValue, setDurationValue] = useState(1)
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('day')

  const consultationTopics = useMemo(() => [
    'Menu planning & Creation',
    'Private dining setup',
    'Restaurant concept development',
    'Kitchen workflow optimization',
    'Chef training',
    'Food costing',
    'Catering business advice',
    'Ingredient sourcing',
    'Wine pairing',
    'Nutrition planning',
  ], [])

  // ================= VALIDATION =================
  const canContinueStep1 =
    title.trim() !== '' &&
    eventDate.trim() !== '' &&
    locationAddress.trim() !== ''

  const canContinueConsultation =
    isConsultation ? topic.trim() !== '' : true

  const validateStep3 = () => {
    if (!title || !eventDate || !locationAddress) return 'Missing basic details'
    if (!isConsultation && guestMax < guestMin) return 'Invalid guest range'
    if (isConsultation && !topic) return 'Select a consultation topic'
    return null
  }

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const validationError = validateStep3()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const insertPayload = {
      user_id: user.id,
      title,
      event_date: eventDate,
      booking_type: bookingType,

      // ✅ correct schema mapping
      guest_count: isConsultation ? null : guestMax,
      dietary_restrictions: dietaryRestrictions || null,
      location_address: locationAddress || null,

      status: 'pending_assignment',
      chef_id: null,

      // ✅ structured JSON (Supabase JSONB-friendly)
      notes: {
        ingredientMode: isConsultation ? null : ingredientMode,
        guestRange: isConsultation
          ? null
          : { min: guestMin, max: guestMax },

        consultation: isConsultation
          ? {
              topic,
              duration: {
                value: durationValue,
                unit: durationUnit,
              },
            }
          : null,
      },
    }

    const { error } = await supabase
      .from('bookings')
      .insert(insertPayload)

    if (error) {
      console.error('Booking insert error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/user-dashboard')
  }

  // ================= UI =================
  return (
    <div className="min-h-svh flex flex-col bg-white">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <Button variant="outline" onClick={() => router.push('/user-dashboard')}>
          Back
        </Button>

        <div className="text-sm text-muted-foreground">
          {isConsultation ? 'Consultation Booking' : 'Event Booking'}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="flex-1 flex justify-center px-4 pt-10">
          <div className="w-full max-w-2xl space-y-5">

            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label>Date</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
            </div>

            {!isConsultation && (
              <div className="flex gap-3 items-center">
                <Input type="number" value={guestMin} onChange={(e) => setGuestMin(Number(e.target.value))} />
                <span>to</span>
                <Input type="number" value={guestMax} onChange={(e) => setGuestMax(Number(e.target.value))} />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
                className="bg-orange-500 text-white"
              >
                Continue
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2 EVENT */}
      {!isConsultation && step === 2 && (
        <div className="flex-1 flex justify-center px-4 pt-10">
          <div className="w-full max-w-2xl space-y-6">

            <div>
              <Label>Dietary Restrictions</Label>
              <Input
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Ingredient Mode</Label>

              <div className="flex gap-3">
                <div
                  onClick={() => setIngredientMode('chef')}
                  className={`flex-1 p-4 border rounded-xl cursor-pointer ${
                    ingredientMode === 'chef' ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  Chef chooses
                </div>

                <div
                  onClick={() => setIngredientMode('user')}
                  className={`flex-1 p-4 border rounded-xl cursor-pointer ${
                    ingredientMode === 'user' ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  I choose
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} className="bg-orange-500 text-white">
                Continue
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2 CONSULTATION */}
      {isConsultation && step === 2 && (
        <div className="flex-1 flex justify-center px-4 pt-10">
          <div className="w-full max-w-2xl space-y-6">

            <div className="grid grid-cols-2 gap-3">
              {consultationTopics.map((t) => (
                <div
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`p-4 border rounded-xl cursor-pointer ${
                    topic === t ? 'border-orange-500 bg-orange-50' : ''
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                type="number"
                value={durationValue}
                onChange={(e) => setDurationValue(Number(e.target.value))}
              />

              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                className="border rounded px-3"
              >
                <option value="day">Days</option>
                <option value="week">Weeks</option>
                <option value="month">Months</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                disabled={!canContinueConsultation}
                onClick={() => setStep(3)}
                className="bg-orange-500 text-white"
              >
                Continue
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="flex-1 flex justify-center px-4 pt-10">
          <div className="w-full max-w-2xl space-y-6">

            {error && (
              <p className="text-red-500">{error}</p>
            )}

            <div className="border rounded-xl p-6 space-y-2">
              <p><b>Title:</b> {title}</p>
              <p><b>Date:</b> {eventDate}</p>
              <p><b>Location:</b> {locationAddress}</p>

              {!isConsultation ? (
                <>
                  <p><b>Guests:</b> {guestMin}-{guestMax}</p>
                  <p><b>Restrictions:</b> {dietaryRestrictions}</p>
                </>
              ) : (
                <>
                  <p><b>Topic:</b> {topic}</p>
                  <p><b>Duration:</b> {durationValue} {durationUnit}</p>
                </>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-500 text-white"
              >
                {loading ? 'Creating...' : 'Confirm Booking'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}