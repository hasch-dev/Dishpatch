import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Create message
    const { data, error } = await supabase
      .from('chats')
      .insert({
        booking_id: body.booking_id,
        sender_id: user.id,
        recipient_id: body.recipient_id,
        message: body.message,
      })
      .select()
      .single()
    
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const recipientId = searchParams.get('recipientId')

    if (!bookingId || !recipientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get messages for this conversation
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        sender:profiles(display_name, avatar_url)
      `)
      .eq('booking_id', bookingId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    )
  }
}
