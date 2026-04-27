"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Sparkles,
  ConciergeBell,
  Heart,
  Clock,
  Coffee,
  Sun,
  Moon,
  ArrowRight,
  Quote,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";

const Reveal = ({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "none";
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 w-full relative overflow-x-hidden antialiased scroll-smooth">
      {/* THEME TOGGLE */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full h-12 w-12 bg-background/80 backdrop-blur-md border-primary/20 shadow-xl"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Navbar />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-12">
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                Bespoke Culinary Residency
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[0.85] tracking-tighter">
                The Restaurant <br />
                <span className="italic font-normal text-primary">
                  is now your home.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.5}>
              <p className="text-lg text-muted-foreground font-light max-w-2xl leading-relaxed">
                Dishpatch is a platform for discerning hosts. We connect
                professional artisans with private kitchens to create
                unforgettable evenings.
              </p>
            </Reveal>

            <Reveal delay={0.7}>
              <Button
                asChild
                size="lg"
                className="h-14 px-12 rounded-none bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-[0.3em]"
              >
                <Link href="/auth/sign-up">Book an Artisan</Link>
              </Button>
            </Reveal>
          </div>
        </section>

        {/* 2. THE SERVICE (REFINED) */}
        <section
          id="experience"
          className="bg-secondary/30 py-32 border-y border-primary/5"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-16 items-start">
              <div className="lg:sticky lg:top-32">
                <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">
                  The Standards
                </span>
                <h2 className="text-5xl font-serif mt-6 leading-tight">
                  Elevating <br />
                  <span className="italic">every detail.</span>
                </h2>
              </div>
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-12">
                {[
                  {
                    title: "Vetted Talent",
                    desc: "We only partner with chefs who have proven professional backgrounds in high-end gastromy.",
                  },
                  {
                    title: "Tailored Menus",
                    desc: "No set templates. Every menu is a collaboration between your vision and the chef’s craft.",
                  },
                  {
                    title: "Seamless Execution",
                    desc: "From ingredient sourcing to the final polish of the countertop, we handle it all.",
                  },
                  {
                    title: "Full Transparency",
                    desc: "Clear pricing, direct communication, and a focus on your security and privacy.",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
                      — {item.title}
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. ABOUT US */}
        <section id="about" className="py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
              <div className="space-y-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                  ABOUT US
                </span>{" "}
                <br />
                <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
                  <p>
                    DISH-PATCH is a modern culinary system built on three core
                    services: Private Chef Experiences, Culinary Consultancy,
                    and a Gastronomy Commissary. We are not a restaurant. We are
                    not a traditional catering service. We are a culinary system
                    designed to deliver great food in three ways: experience,
                    knowledge, and product.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-primary transition-colors"
                  >
                    Meet the Team <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TESTIMONIALS (VISUAL GRID) */}
        <section id="testimonials" className="py-32 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px]">
                Client Stories
              </span>
              <h2 className="text-5xl font-serif mt-4">
                Nights worth <span className="italic">remembering.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  img: "https://images.unsplash.com/photo-1550966841-3ee5ad60b051?q=80&w=2000",
                  quote:
                    "An anniversary we'll never forget. The chef brought the soul of Italy to our backyard.",
                  author: "Julianne V.",
                },
                {
                  img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000",
                  quote:
                    "Zero cleaning, zero shopping, and the best sea bass I have ever tasted.",
                  author: "Marcus K.",
                },
                {
                  img: "https://images.unsplash.com/photo-1528605248644-14dd04322a11?q=80&w=2000",
                  quote:
                    "Hosting 12 people was effortless. I actually got to talk to my guests for once.",
                  author: "Sarah L.",
                },
              ].map((t, i) => (
                <div key={i} className="space-y-6 group">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={t.img}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt="Experience"
                    />
                  </div>
                  <div className="px-2">
                    <Quote className="w-5 h-5 text-primary/30 mb-4" />
                    <p className="text-lg font-serif italic text-foreground mb-4">
                      "{t.quote}"
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      — {t.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
