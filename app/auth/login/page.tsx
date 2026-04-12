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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex">

      {/* LEFT SIDE (BRAND / HERO) */}
      <div className="hidden md:flex flex-1 bg-orange-500 text-white flex-col justify-center px-16 gap-16">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            Hire the Perfect Chef
          </h1>
          <p className="text-lg opacity-90 max-w-md">
            Connect with professional chefs for your events, private dining,
            and special occasions.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE (LOGIN FORM) */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">

          {/* MOBILE BACK BUTTON */}
          <div className="mb-4 md:hidden">
            <Link href="/">
              <Button variant="outline" className="w-full">
                ← Back to Home
              </Button>
            </Link>
          </div>

          <Card className="border-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Login
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-8">

                {/* EMAIL */}
                <div>
                  <Label className='pb-1'>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <Label className='pb-1'>Password</Label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                {/* LOGIN BUTTON */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                {/* SIGN UP */}
                <p className="text-center text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Sign up
                  </Link>
                </p>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}