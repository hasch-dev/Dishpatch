'use client'

import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/password-validation'
import { validateEmail } from '@/lib/email-validation'
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [userType, setUserType] = useState<'user' | 'chef'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)


  const router = useRouter()

  const emailValidation = validateEmail(email)
  const passwordStrength = validatePassword(password)
  const passwordsMatch = password === repeatPassword && password.length > 0

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email')
      setIsLoading(false)
      return
    }

    if (!passwordStrength.isValid) {
      setError('Password does not meet requirements')
      setIsLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!displayName.trim()) {
      setError('Display name required')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            user_type: userType,
          }
        }
      })

      if (error) throw error

      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-1 bg-orange-500 text-white flex-col justify-center px-16 gap-16">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            Start Your Culinary Journey
          </h1>

          <p className="text-lg opacity-90 max-w-md">
            Whether you&apos;re hiring or cooking, create your account and connect
            with amazing experiences.
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

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 ">
        <div className="w-full max-w-md">

          {/* MOBILE BACK */}
          <div className="mb-4 md:hidden">
            <Link href="/">
              <Button variant="outline" className="w-full">
                ← Back to Home
              </Button>
            </Link>
          </div>

          {/* FORM (NO CARD = CLEAN) */}
          <form onSubmit={handleSignUp} className="space-y-6">

            <h2 className="text-3xl font-bold text-center mb-2">
              Create Account
            </h2>

            {/* NAME */}
            <div>
              <Label className='mb-1'>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* ACCOUNT TYPE */}
            <div>
              <Label className='mb-1'>Account Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={userType}
                onChange={(e) =>
                  setUserType(e.target.value as 'user' | 'chef')
                }
              >
                <option value="user">Looking for a chef</option>
                <option value="chef">I&apos;m a chef</option>
              </select>
            </div>

            {/* EMAIL */}
            <div>
              <Label className='mb-1'>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={
                  email
                    ? emailValidation.isValid
                      ? 'border-green-500'
                      : 'border-red-500'
                    : ''
                }
              />
              {email && !emailValidation.isValid && (
                <p className="text-xs text-red-500">
                  {emailValidation.error}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Label className='mb-1'>Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-38px text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <PasswordStrengthIndicator strength={passwordStrength} />
            </div>

            {/* REPEAT PASSWORD */}
            <div>
              <Label>Repeat Password</Label>
              <Input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className={
                  repeatPassword
                    ? passwordsMatch
                      ? 'border-green-500'
                      : 'border-red-500'
                    : ''
                }
              />
              {repeatPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
              
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={
                isLoading ||
                !passwordStrength.isValid ||
                !passwordsMatch ||
                !emailValidation.isValid
              }
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>

            {/* LOGIN */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-orange-500 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}