'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { validatePassword } from '@/lib/password-validation'
import { validateEmail } from '@/lib/email-validation'
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Eye, EyeOff, User, ChefHat, ChevronLeft, Sparkles } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [userType, setUserType] = useState<'user' | 'chef'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const emailValidation = validateEmail(email)
  const passwordStrength = validatePassword(password)
  const passwordsMatch = password === repeatPassword && password.length > 0

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!emailValidation.isValid || !passwordStrength.isValid || !passwordsMatch || !displayName.trim()) {
      setError('Please ensure all fields are correctly completed.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="flex min-h-screen bg-background">

      {/* LEFT SIDE: STICKY BRAND PANEL */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-col justify-between w-[38%] h-screen sticky top-0 bg-secondary p-16 overflow-hidden border-r border-primary/10"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-lg font-serif tracking-widest uppercase text-secondary-foreground">Dishpatch</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3" />
            Registry
          </div>
          <h1 className="text-6xl font-serif leading-[1.1] text-secondary-foreground tracking-tighter">
            Join the <br /> <span className="italic text-primary">Collective.</span>
          </h1>
          <p className="text-base text-secondary-foreground/60 font-light max-w-sm leading-relaxed">
            Create an account to discover elite chefs or to share your culinary artistry with the world.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-secondary-foreground/30 font-medium">Dishpatch © 2026</p>
        </div>
      </motion.div>

      {/* RIGHT SIDE: SCROLLABLE FORM SECTION */}
      <div className="flex-1 flex flex-col items-center bg-background px-8 lg:px-20 py-20 relative">
        
        <div className="absolute top-10 right-10 z-20">
          <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all">
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl space-y-16"
        >
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-5xl font-serif text-foreground tracking-tight">
              Sign <span className="italic text-primary">Up</span>
            </h2>
            <div className="h-px w-12 bg-primary/40" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold">Registration Portal</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-12">
            
            {/* MEMBERSHIP TYPE */}
            <div className="space-y-6">
              <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">Membership Type</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "user" | "chef")}
                className="grid grid-cols-2 gap-6"
              >
                <Label
                  htmlFor="user"
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-10 rounded-none border border-primary/10 bg-transparent cursor-pointer transition-all hover:border-primary/30",
                    userType === 'user' ? "border-primary bg-primary/[0.03] shadow-inner" : "text-muted-foreground"
                  )}
                >
                  <RadioGroupItem value="user" id="user" className="sr-only" />
                  <User className={cn("w-6 h-6 transition-colors", userType === 'user' ? "text-primary" : "text-muted-foreground/40")} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-center leading-loose">I am looking <br/> for a chef</span>
                </Label>

                <Label
                  htmlFor="chef"
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-10 rounded-none border border-primary/10 bg-transparent cursor-pointer transition-all hover:border-primary/30",
                    userType === 'chef' ? "border-primary bg-primary/[0.03] shadow-inner" : "text-muted-foreground"
                  )}
                >
                  <RadioGroupItem value="chef" id="chef" className="sr-only" />
                  <ChefHat className={cn("w-6 h-6 transition-colors", userType === 'chef' ? "text-primary" : "text-muted-foreground/40")} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-center leading-loose">I am a <br/> professional chef</span>
                </Label>
              </RadioGroup>
            </div>

            {/* INPUT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Julian Thorne"
                  /* Added px-4 */
                  className="h-12 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all px-4 placeholder:text-muted-foreground/20 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  /* Added px-4 */
                  className="h-12 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all px-4 placeholder:text-muted-foreground/20 text-lg"
                />
              </div>

              <div className="space-y-2 relative">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    /* Added px-4 and pr-12 for icon safety */
                    className="h-12 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all px-4 pr-12 text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 bottom-3 text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                <PasswordStrengthIndicator strength={passwordStrength} />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">Confirm Password</Label>
                <Input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  /* Added px-4 */
                  className="h-12 bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all px-4 text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="py-4 border-y border-destructive/10">
                 <p className="text-[10px] uppercase tracking-widest text-destructive font-bold text-center italic">
                   Attention: {error}
                 </p>
              </div>
            )}

            <div className="pt-10 space-y-10">
              <Button
                type="submit"
                disabled={isLoading || !passwordStrength.isValid || !passwordsMatch || !emailValidation.isValid}
                className="w-full h-16 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-primary/10"
              >
                {isLoading ? 'Verifying Details...' : 'Complete Registration'}
              </Button>

              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-muted-foreground/20" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Already registered?{' '}
                  <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-8 ml-1 transition-all">
                    Login
                  </Link>
                </p>
                <div className="h-px w-8 bg-muted-foreground/20" />
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}