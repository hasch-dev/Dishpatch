'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ConciergeBell,
  UtensilsCrossed,
  Heart,
  Star
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 w-full relative overflow-x-hidden antialiased">
      <Navbar />
      
      <main>
        {/* 1. HERO SECTION: THE GOLDEN HOUR */}
        <section className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-20 md:pt-28 md:pb-32">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            
            {/* Left: Warm Typography */}
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mx-auto lg:mx-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Gold Standard of Dining
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] tracking-tight text-foreground">
                  Exquisite Flavors, <br/>
                  <span className="italic font-normal text-primary">Tailored</span> <br/>
                  To Your Lifestyle.
                </h1>
                
                <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Dishpatch curates an elite circle of culinary artisans for your private residencies. Experience a world where discretion meets the pinnacle of gastronomic art.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-300 shadow-xl shadow-primary/20 border-none">
                    Inquire for Residency
                  </Button>
                </Link>
                <Link href="/auth/sign-up?type=chef">
                  <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-primary/30 bg-transparent text-primary hover:bg-primary/5 font-bold text-sm transition-all">
                    Join the Collective
                  </Button>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 border-t border-primary/10 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                       <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                       </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Trusted by Global Connoisseurs</p>
              </div>
            </div>

            {/* Right: Soft Bento Collage with Gold Borders */}
            <div className="relative h-[550px] w-full px-4 lg:px-0">
               {/* Ambient Golden Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
               
               <div className="grid grid-cols-12 grid-rows-12 h-full gap-4">
                  <div className="col-span-7 row-span-8 rounded-[2.5rem] bg-muted overflow-hidden shadow-2xl border-[6px] border-background transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                  <div className="col-span-5 row-span-5 rounded-[2.5rem] bg-muted overflow-hidden shadow-2xl border-[6px] border-background mt-8 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                  <div className="col-span-5 row-span-7 rounded-[2.5rem] bg-muted overflow-hidden shadow-2xl border-[6px] border-background transform rotate-2 hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                  <div className="col-span-7 row-span-4 rounded-[2.5rem] bg-muted overflow-hidden shadow-2xl border-[6px] border-background -mt-4 transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550966841-3ee322878b44?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. THE PHILOSOPHY (USING PRIMARY COLORS AS ACCENTS) */}
        <section className="bg-white/50 dark:bg-black/20 py-32 relative border-y border-primary/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-24 space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">The Ethos</span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">A legacy of <span className="italic text-primary">refined</span> taste.</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { icon: ShieldCheck, title: 'Unrivaled Privacy', desc: 'Encrypted communication and silent coordination for your complete peace of mind.' },
                { icon: Heart, title: 'The Human Element', desc: 'We value connections over transactions. Every meal is built on your personal story.' },
                { icon: UtensilsCrossed, title: 'Michelin Mastery', desc: 'Direct access to the hands that have defined global gastronomy.' },
                { icon: ConciergeBell, title: 'White Glove Handling', desc: 'Full-service management from sourcing the rare to the final table reset.' }
              ].map((item, i) => (
                <div key={i} className="group relative p-10 rounded-[2.5rem] bg-background border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <item.icon className="w-16 h-16 text-primary" />
                  </div>
                  <div className="mb-8 h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                    <item.icon className="w-7 h-7 stroke-[1.25px]" />
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. REFINED CALL TO ACTION (DEEP OBSIDIAN & GOLD) */}
        <section className="py-28 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-foreground px-8 py-24 text-center relative overflow-hidden shadow-2xl border border-primary/10">
             {/* Subdued Gold Light Leak */}
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
             
             <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-7xl font-serif text-background leading-[1.1]">
                    Begin Your <br/> <span className="italic font-normal text-primary">New Tradition.</span>
                  </h2>
                  <p className="text-muted-foreground/80 font-light text-xl max-w-lg mx-auto">
                    Membership is limited. Begin your application for private culinary access today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/20 border-none">
                      Request Membership
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="h-16 px-8 text-background/70 hover:text-primary hover:bg-white/5 font-bold text-sm uppercase tracking-widest">
                      Member Portal <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
             </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}