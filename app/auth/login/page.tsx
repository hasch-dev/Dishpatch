'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { ChefHat, ChevronLeft, Sparkles } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">

      {/* LEFT SIDE: BRAND PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] relative bg-secondary p-16 overflow-hidden border-r border-primary/10">
        {/* Subtle texture for depth */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <ChefHat className="h-6 w-6 stroke-[1.5px]" />
            </div>
            <span className="text-xl font-serif tracking-widest uppercase text-secondary-foreground">
              Dishpatch
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3" />
            Member Access
          </div>
          <h1 className="text-6xl xl:text-7xl font-serif leading-[1.1] text-secondary-foreground tracking-tighter">
            Welcome <br />
            <span className="italic text-primary">Back.</span>
          </h1>
          <p className="text-lg text-secondary-foreground/60 font-light max-w-md leading-relaxed">
            Log in to manage your private chef bookings and culinary experiences.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-secondary-foreground/30 font-medium">
            Dishpatch © 2026
          </p>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* RIGHT SIDE: LOGIN PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 lg:px-24 relative">
        
        <div className="absolute top-10 right-10">
          <Link href="/">
            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-secondary transition-all">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}