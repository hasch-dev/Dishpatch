'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChefHat, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react'
import { UpdatePasswordForm } from "@/components/update-password-form"

export default function UpdatePasswordPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            <ShieldCheck className="w-3 h-3" />
            Security Protocol
          </div>
          <h1 className="text-6xl font-serif leading-[1.1] text-secondary-foreground tracking-tighter">
            Protect Your <br /> <span className="italic text-primary">Access.</span>
          </h1>
          <p className="text-base text-secondary-foreground/60 font-light max-w-sm leading-relaxed">
            Ensure your account remains secure with a sophisticated password. We recommend a combination of artistry and complexity.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-secondary-foreground/30 font-medium">Dishpatch © 2026</p>
        </div>
      </motion.div>

      {/* RIGHT SIDE: FORM CONTAINER */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 lg:px-20 relative">
        <div className="absolute top-10 right-10">
          <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all">
            <Link href="/auth/login" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Cancel
            </Link>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <UpdatePasswordForm />
        </motion.div>
      </div>
    </div>
  )
}