'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, ShieldCheck, Sparkles, ConciergeBell,
  UtensilsCrossed, Heart, Star
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function LandingPage() {
  return (
    // Added scroll-smooth here
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 w-full relative overflow-x-hidden antialiased scroll-smooth">
      <Navbar />
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-20 md:pt-12 md:pb-32">
          {/* ... Hero Content (same as before) ... */}
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mx-auto lg:mx-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Crafting Memories at Your Table
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05] tracking-tight text-foreground">
                  Exquisite Flavors, <br/>
                  <span className="italic font-normal text-primary">Lovingly Crafted</span> <br/>
                  For Your Home.
                </h1>
                <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Dishpatch brings the heart of fine dining into the warmth of your own kitchen.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-bold border-none">
                    Book Your Experience
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-[550px] w-full">
               <div className="grid grid-cols-12 grid-rows-12 h-full gap-4">
                  {/* Bento images here */}
                  <div className="col-span-12 row-span-12 rounded-[2.5rem] bg-muted overflow-hidden shadow-2xl border-[6px] border-background">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. THE EXPERIENCE SECTION (ID: experience) */}
        <section id="experience" className="bg-white/50 dark:bg-black/20 py-32 relative border-y border-primary/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-24 space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">How we care for you</span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">Dining that feels like <span className="italic text-primary">home.</span></h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { icon: ShieldCheck, title: 'Vetted with Care', desc: 'Hand-selected talent for your peace of mind.' },
                { icon: Heart, title: 'Heartfelt Service', desc: 'Menus built around your personal story.' },
                { icon: UtensilsCrossed, title: 'World-Class Skill', desc: 'Michelin artistry in a relaxed setting.' },
                { icon: ConciergeBell, title: 'Full Relaxation', desc: 'We handle everything from shopping to cleaning.' }
              ].map((item, i) => (
                <div key={i} className="group relative p-10 rounded-[2.5rem] bg-background border border-primary/10 hover:border-primary/30 transition-all duration-500">
                  <div className="mb-8 h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                    <item.icon className="w-7 h-7 stroke-[1.25px]" />
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OUR PROCESS (ID: process) */}
        <section id="process" className="py-32 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl font-serif">The Path to <span className="italic text-primary">Perfection</span></h2>
              <p className="text-muted-foreground font-light">From first inquiry to the final pour, we orchestrate every detail so you can simply enjoy the moment.</p>
            </div>
            {/* You can add a 3-step process here later */}
            <div className="grid md:grid-cols-3 gap-12 mt-16">
               <div className="space-y-4">
                 <div className="text-4xl font-serif text-primary/30 italic">01</div>
                 <h4 className="font-bold uppercase tracking-widest text-xs">Share Your Vision</h4>
               </div>
               <div className="space-y-4">
                 <div className="text-4xl font-serif text-primary/30 italic">02</div>
                 <h4 className="font-bold uppercase tracking-widest text-xs">Meet Your Chef</h4>
               </div>
               <div className="space-y-4">
                 <div className="text-4xl font-serif text-primary/30 italic">03</div>
                 <h4 className="font-bold uppercase tracking-widest text-xs">Savor the Evening</h4>
               </div>
            </div>
          </div>
        </section>

        {/* 4. GIFT AN EVENING / CTA (ID: gift) */}
        <section id="gift" className="py-28 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-foreground px-8 py-24 text-center relative overflow-hidden shadow-2xl border border-primary/10">
             <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <h2 className="text-4xl md:text-7xl font-serif text-background leading-[1.1]">
                  Gift a <br/> <span className="italic font-normal text-primary">New Tradition.</span>
                </h2>
                <p className="text-muted-foreground/80 font-light text-xl max-w-lg mx-auto">
                  The perfect gift isn't an object—it's an unforgettable evening.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest shadow-xl shadow-primary/20 border-none transition-all">
                      Purchase a Gift Experience
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