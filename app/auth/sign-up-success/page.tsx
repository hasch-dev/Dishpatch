'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChefHat, MailCheck, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* LEFT SIDE: STICKY BRAND PANEL (Identical for continuity) */}
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
            An Invitation <br /> <span className="italic text-primary">Awaits.</span>
          </h1>
          <p className="text-base text-secondary-foreground/60 font-light max-w-sm leading-relaxed">
            Your credentials have been submitted to the collective. One final step remains to secure your access.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-secondary-foreground/30 font-medium">Dishpatch © 2026</p>
        </div>
      </motion.div>

      {/* RIGHT SIDE: SUCCESS MESSAGE */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 lg:px-20 relative">
        
        <div className="absolute top-10 right-10">
          <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all">
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Exit to Home
            </Link>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-xl text-center space-y-12"
        >
          {/* Visual Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative h-24 w-24 bg-background border border-primary/20 rounded-full flex items-center justify-center shadow-2xl">
                <MailCheck className="h-10 w-10 text-primary stroke-[1px]" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-5xl font-serif text-foreground tracking-tight">
              Confirm Your <span className="italic text-primary">Identity</span>
            </h2>
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground font-bold">Verification Required</p>
            <div className="h-px w-16 bg-primary/30 mx-auto mt-6" />
          </div>

          <div className="space-y-6 text-muted-foreground font-light text-lg leading-relaxed">
            <p>
              We have dispatched a confirmation link to your inbox. Please follow the instructions to activate your membership.
            </p>
            
            {/* Callout box - kept minimalist */}
            <div className="p-8 border border-primary/10 bg-primary/[0.02] text-left space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground italic flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Note for Artisans & Hosts
              </h3>
              <p className="text-sm leading-relaxed">
                Once confirmed, you may complete your professional dossier. Providing high-resolution imagery and a detailed culinary narrative will significantly increase your visibility within the collective.
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="pt-8">
            <Button asChild size="lg" className="h-16 px-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-primary/10">
              <Link href="/auth/login" className="flex items-center gap-3">
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}