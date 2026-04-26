'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, Sparkles, ConciergeBell,
  UtensilsCrossed, Heart, Clock, Coffee,
  Sun, Moon
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'

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
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 w-full relative overflow-x-hidden antialiased scroll-smooth transition-colors duration-700 ease-in-out">
      
      {/* --- HORIZONTAL THEME SLIDER --- */}
      <div className="fixed top-24 right-8 z-[100] flex items-center gap-4 bg-background/40 backdrop-blur-xl p-2 rounded-full border border-border shadow-2xl transition-all duration-700">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-2 hidden sm:block">
          {theme === 'dark' ? 'Studio Dark' : 'Studio Light'}
        </span>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative h-8 w-14 rounded-full bg-muted border border-border flex items-center transition-all duration-500 group overflow-hidden"
        >
          {/* Sliding Indicator */}
          <motion.div 
            layout
            className="absolute z-10 w-6 h-6 bg-primary rounded-full shadow-md flex items-center justify-center"
            animate={{ 
              left: theme === 'dark' ? 'calc(100% - 1.75rem)' : '0.25rem' 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {theme === 'dark' ? (
              <Moon className="w-3 h-3 text-primary-foreground" />
            ) : (
              <Sun className="w-3 h-3 text-primary-foreground" />
            )}
          </motion.div>

          <div className="flex w-full justify-between px-2 text-muted-foreground/30">
            <Sun className="w-3.5 h-3.5" />
            <Moon className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      <Navbar />
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 md:pt-12 md:pb-32 transition-colors duration-700">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <div className="space-y-6">
                <Reveal delay={0.1}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mx-auto lg:mx-0 shadow-sm transition-all duration-700">
                    <Coffee className="w-3.5 h-3.5" />
                    Better dining, right at home
                  </div>
                </Reveal>
                
                <Reveal delay={0.3}>
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[0.95] tracking-tighter text-foreground transition-colors duration-700">
                    Great Food. <br/>
                    <span className="italic font-normal text-primary">Your Kitchen.</span> <br/>
                    No Stress.
                  </h1>
                </Reveal>
                
                <Reveal delay={0.5}>
                  <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0 transition-colors duration-700">
                    Dishpatch connects you with professional chefs who handle the shopping, cooking, and cleaning. Enjoy restaurant-quality meals without leaving your house.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.7}>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                  <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-500 shadow-xl shadow-primary/10 border-none">
                    <Link href="/auth/sign-up">
                      Find a Local Chef
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Right: Hero Image Reveal */}
            <Reveal delay={0.4} direction="none">
              <div className="relative h-[600px] w-full group">
                 <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-2 scale-105 transition-colors duration-700" />
                 <div className="relative h-full w-full rounded-[2.5rem] bg-secondary overflow-hidden shadow-2xl border-[8px] border-background transition-all duration-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80')] bg-cover bg-center transition-opacity duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent transition-colors duration-700" />
                 </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. THE SERVICE */}
        <section id="experience" className="bg-secondary py-32 relative overflow-hidden transition-colors duration-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <Reveal>
              <div className="text-center mb-24 space-y-4">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">How it works</span>
                <h2 className="text-4xl md:text-6xl font-serif text-secondary-foreground transition-colors duration-700">Professional cooking, <br/><span className="italic text-primary">personal service.</span></h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: ShieldCheck, title: 'Trusted Professionals', desc: 'Every chef is background-checked and vetted for quality so you can relax.' },
                { icon: Heart, title: 'Cooked Your Way', desc: 'Dietary needs, allergies, or just picky eaters—we tailor everything to your taste.' },
                { icon: Clock, title: 'Save Your Time', desc: 'No grocery lines, no prep work, and no dishes. We handle the entire process.' },
                { icon: ConciergeBell, title: 'Simple Booking', desc: 'Pick your date, choose your menu, and wait for the doorbell. It’s that easy.' }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group p-8 rounded-2xl bg-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/40 transition-all duration-700">
                    <div className="mb-8 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-all duration-700">
                      <item.icon className="w-6 h-6 stroke-[1.5px]" />
                    </div>
                    <h3 className="text-xl font-serif text-foreground transition-colors duration-700 mb-4">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light transition-colors duration-700">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OUR PROCESS */}
        <section id="process" className="py-32 bg-background transition-colors duration-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <Reveal>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-serif text-foreground transition-colors duration-700">Effortless <br/><span className="italic text-primary">Hospitality.</span></h2>
                    <p className="text-muted-foreground font-light text-lg transition-colors duration-700">We bring the restaurant experience to your dining room table.</p>
                  </div>
                </Reveal>

                <div className="space-y-10">
                  {[
                    { num: '01', title: 'Plan Your Meal', desc: 'Select a menu that fits your mood, from casual family dinners to small gatherings.' },
                    { num: '02', title: 'We Shop & Prep', desc: 'Your chef arrives with fresh ingredients and gets to work in your kitchen.' },
                    { num: '03', title: 'Enjoy & Relax', desc: 'Eat a fresh meal and enjoy your evening. We leave your kitchen spotless.' }
                  ].map((step, idx) => (
                    <Reveal key={idx} delay={idx * 0.2}>
                      <div className="flex gap-8 group">
                        <div className="text-2xl font-serif text-primary/40 group-hover:text-primary transition-colors duration-500 italic">{step.num}</div>
                        <div className="space-y-2">
                          <h4 className="font-bold uppercase tracking-widest text-xs text-foreground transition-colors duration-700">{step.title}</h4>
                          <p className="text-sm text-muted-foreground font-light leading-relaxed transition-colors duration-700">{step.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal direction="none" delay={0.4}>
                <div className="grid grid-cols-2 gap-4 h-[500px]">
                  <div className="rounded-2xl bg-muted overflow-hidden border border-primary/10 transition-colors duration-700">
                    <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                  <div className="rounded-2xl bg-muted overflow-hidden border border-primary/10 translate-y-8 transition-colors duration-700">
                     <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 4. CALL TO ACTION */}
        <section id="gift" className="py-28 px-6 lg:px-8">
          <Reveal>
            <div className="max-w-6xl mx-auto rounded-[3rem] bg-secondary px-8 py-24 text-center relative overflow-hidden border border-primary/10 transition-colors duration-700">
               <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-8xl font-serif text-secondary-foreground leading-none tracking-tighter transition-colors duration-700">
                      Ready for a <br/> <span className="italic font-normal text-primary">Better</span> Dinner?
                    </h2>
                    <p className="text-secondary-foreground/60 font-light text-xl max-w-lg mx-auto transition-colors duration-700">
                      Join Dishpatch today and see how easy professional home dining can be.
                    </p>
                  </div>
                  <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 border-none hover:scale-105 transition-all duration-500">
                    <Link href="/auth/sign-up">
                      Get Started
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