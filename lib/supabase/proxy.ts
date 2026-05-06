// proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  // This is the "hassle-killer": it refreshes the session automatically
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public Home Page
  if (path === '/') {
    return supabaseResponse
  }

  // App Gate: Redirect to login if trying to access dashboard/booking without a session
  const isAppRoute = path.startsWith('/dashboard') || 
                     path.startsWith('/booking') || 
                     path.startsWith('/protected')

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Auth Gate: Redirect to dashboard if user is already logged in
  const isAuthRoute = path.startsWith('/auth/login') || 
                      path.startsWith('/auth/sign-up')

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}