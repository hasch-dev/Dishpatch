import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const cuisine = searchParams.get('cuisine')
    const minRating = searchParams.get('minRating')

    let query = supabase
      .from('master')
      .select(`
        id,
        display_name,
        bio,
        avatar_url,
        location_address,
        chef_details (
          cuisine_types,
          experience_years,
          rating,
          total_bookings,
          session_rate,
          is_verified
        )
      `)
      .eq('user_type', 'chef')

    if (cuisine) {
      query = query.contains('chef_details.cuisine_types', [cuisine])
    }

    if (minRating) {
      query = query.gte('chef_details.rating', parseFloat(minRating))
    }

    const { data, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Chefs fetch error:', error)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}