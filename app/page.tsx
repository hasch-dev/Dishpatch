'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, Sparkles, ConciergeBell,
  UtensilsCrossed, Heart
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// --- ANIMATION HELPER ---
const Reveal = ({ children, delay = 0, direction = "up" }: { 
  children: React.ReactNode, 
  delay?: number, 
  direction?: "up" | "down" | "none" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: direction === "up" ? 20 : direction === "down" ? -20 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null // Cleaner return for hydration safety

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 w-full relative overflow-x-hidden antialiased scroll-smooth">
      <Navbar />
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 md:pt-12 md:pb-32">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="space-y-6">
                <Reveal delay={0.1}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mx-auto lg:mx-0 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    The Sovereign Standard of Dining
                  </div>
                </Reveal>
                
                <Reveal delay={0.3}>
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[0.95] tracking-tighter text-foreground">
                    A Culinary <br/>
                    <span className="italic font-normal text-primary">Masterpiece</span> <br/>
                    At Home.
                  </h1>
                </Reveal>
                
                <Reveal delay={0.5}>
                  <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Dishpatch orchestrates private gastronomic experiences that transcend the ordinary. Every meal is a legacy; every service is a ceremony.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.7}>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                  {/* FIXED LINK TAG */}
                  <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-300 shadow-xl shadow-primary/30 border-none">
                    <Link href="/auth/sign-up">
                      Begin Your Experience
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Right: Hero Image Reveal */}
            <Reveal delay={0.4} direction="none">
              <div className="relative h-[600px] w-full group">
                 <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3 scale-105 transition-transform group-hover:rotate-0 duration-1000" />
                 <div className="relative h-full w-full rounded-[2.5rem] bg-secondary overflow-hidden shadow-2xl border-[8px] border-background">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.5 }}
                      className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent" />
                 </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. THE EXPERIENCE */}
        <section id="experience" className="bg-secondary py-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent opacity-30" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <Reveal>
              <div className="text-center mb-24 space-y-4">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">The Signature Service</span>
                <h2 className="text-4xl md:text-6xl font-serif text-secondary-foreground">The Art of the <span className="italic text-primary">Private Table.</span></h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: ShieldCheck, title: 'Vetted Artisans', desc: 'A curated circle of the finest chefs, strictly background-vetted for your security.' },
                { icon: Heart, title: 'Personalized Menus', desc: 'We do not follow trends; we follow your palate. Every dish is a collaboration.' },
                { icon: UtensilsCrossed, title: 'Michelin Lineage', desc: 'Direct access to the hands that have led the world’s most prestigious kitchens.' },
                { icon: ConciergeBell, title: 'Total Stewardship', desc: 'From the first ingredient to the final glass polished, we handle everything.' }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group p-8 rounded-2xl bg-background/5 border border-primary/10 hover:border-primary/40 transition-all duration-500 hover:bg-background/10">
                    <div className="mb-8 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <item.icon className="w-6 h-6 stroke-[1.25px]" />
                    </div>
                    <h3 className="text-xl font-serif text-secondary-foreground mb-4">{item.title}</h3>
                    <p className="text-sm text-secondary-foreground/60 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OUR PROCESS */}
        <section id="process" className="py-32 bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <Reveal>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-serif text-foreground">A Flawless <br/><span className="italic text-primary">Choreography.</span></h2>
                    <p className="text-muted-foreground font-light text-lg">Hospitality is the invisible art of anticipation.</p>
                  </div>
                </Reveal>

                <div className="space-y-10">
                  {[
                    { num: 'I', title: 'The Consultation', desc: 'Our concierge learns your dietary narrative and aesthetic preferences.' },
                    { num: 'II', title: 'The Pairing', desc: 'We match you with a chef whose style mirrors your vision.' },
                    { num: 'III', title: 'The Performance', desc: 'An evening of flawless execution, fine wine, and impeccable flavors.' }
                  ].map((step, idx) => (
                    <Reveal key={idx} delay={idx * 0.2}>
                      <div className="flex gap-8 group">
                        <div className="text-2xl font-serif text-primary/40 group-hover:text-primary transition-colors italic">{step.num}</div>
                        <div className="space-y-2">
                          <h4 className="font-bold uppercase tracking-widest text-xs text-foreground">{step.title}</h4>
                          <p className="text-sm text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal direction="none" delay={0.4}>
                <div className="grid grid-cols-2 gap-4 h-[500px]">
                  <div className="rounded-2xl bg-muted overflow-hidden border border-primary/10">
                    <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                  <div className="rounded-2xl bg-muted overflow-hidden border border-primary/10 translate-y-8">
                     <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 4. GIFT AN EVENING */}
        <section id="gift" className="py-28 px-6 lg:px-8">
          <Reveal>
            <div className="max-w-6xl mx-auto rounded-[3rem] bg-foreground px-8 py-24 text-center relative overflow-hidden shadow-2xl border border-primary/20">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.15),transparent)]" />
               
               <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-8xl font-serif text-background leading-none tracking-tighter">
                      Bestow an <br/> <span className="italic font-normal text-primary">Unforgettable</span> Evening.
                    </h2>
                    <p className="text-muted-foreground/80 font-light text-xl max-w-lg mx-auto">
                      The gift of Dishpatch is an entry into a world of exclusive culinary mastery.
                    </p>
                  </div>
                  {/* FIXED LINK TAG */}
                  <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/40 border-none hover:scale-105 transition-transform">
                    <Link href="/auth/sign-up">
                      Purchase an Invitation
                    </Link>
                  </Button>
               </div>
            </div>
          </Reveal>
        </section>

        <Footer />
      </main>
    </div>
  )
}