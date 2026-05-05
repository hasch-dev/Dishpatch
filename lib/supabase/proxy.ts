import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Initialize Supabase client with SSR cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not remove getUser(). This refreshes the session if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. PUBLIC LANDING PAGE
  // Always allow access to the home page so you can "come back" to it.
  if (path === '/') {
    return supabaseResponse
  }

  // 2. PROTECTED APP ROUTES
  // If no user is present, redirect anyone trying to access the app logic to login.
  const isAppRoute = path.startsWith('/dashboard') || 
                     path.startsWith('/booking') || 
                     path.startsWith('/protected')

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 3. AUTH GATE
  // If a user is already signed in, prevent them from seeing Login/Sign-up.
  // Instead, bounce them to the dashboard.
  const isAuthRoute = path.startsWith('/auth/login') || 
                      path.startsWith('/auth/sign-up')

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Return the supabaseResponse to maintain cookie sync
  return supabaseResponse
}