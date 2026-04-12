import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const cuisine = searchParams.get('cuisine')
    const location = searchParams.get('location')
    const minRating = searchParams.get('minRating')
    
    let query = supabase
      .from('profiles')
      .select(
        `
        id,
        display_name,
        bio,
        avatar_url,
        location_address,
        location_lat,
        location_lng,
        chef_details:chef_details(
          cuisine_types,
          experience_years,
          rating,
          total_bookings,
          hourly_rate,
          is_verified
        )
      `
      )
      .eq('user_type', 'chef')

    // Filter by cuisine if provided
    if (cuisine) {
      query = query.contains('chef_details.cuisine_types', [cuisine])
    }

    // Filter by minimum rating if provided
    if (minRating) {
      query = query.gte('chef_details.rating', parseFloat(minRating))
    }

    const { data, error } = await query.limit(50)

    if (error) throw error

    // Filter by location if provided (client-side for simplicity)
    let results = data || []
    if (location) {
      const locationLower = location.toLowerCase()
      results = results.filter(
        (chef) =>
          chef.location_address?.toLowerCase().includes(locationLower)
      )
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Chefs fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
