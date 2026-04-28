'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type UserType = 'user' | 'chef' | null

export function useRequireAuth(options?: {
  redirectTo?: string
  requireUserType?: UserType
}) {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<UserType>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace(options?.redirectTo || '/auth/login')
          return
        }

        const type =
          (user.user_metadata?.user_type as UserType) || 'user'

        if (options?.requireUserType && type !== options.requireUserType) {
          router.replace('/dashboard')
          return
        }

        setUser(user)
        setUserType(type)
      } catch (err) {
        console.error('Auth error:', err)
        router.replace('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase, options])

  return { user, userType, isLoading }
}