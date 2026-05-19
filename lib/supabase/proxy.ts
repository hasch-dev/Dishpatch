import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  /**
   * IMPORTANT:
   * Always call getUser() immediately after creating the client.
   * This refreshes expired sessions automatically.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  /**
   * PUBLIC ROUTES
   */
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/sign-up',
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`),
  )

  /**
   * PROTECTED ROUTES
   */
  const protectedRoutes = [
    '/dashboard',
    '/booking',
    '/protected',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  /**
   * Redirect unauthenticated users
   */
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  /**
   * Prevent authenticated users from visiting auth pages
   */
  const isAuthPage =
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/sign-up')

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

/**
 * Run proxy on all routes except:
 * - static files
 * - images
 * - favicon
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}