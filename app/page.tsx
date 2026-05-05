"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Eye,
  UtensilsCrossed,
  Quote,
  ArrowRight,
  Plus,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const Reveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  const galleryImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground" id="system">
      <Navbar />

      <main>
        {/* HERO: Simplified and More Personal */}
        <section className="relative min-h-[95vh] flex items-center pt-12">
          <div className="container mx-auto px-8 grid lg:grid-cols-12 gap-0 items-center">
            <div className="lg:col-span-6 z-20 bg-background/80 backdrop-blur-md lg:bg-transparent py-12 lg:py-0">
              <Reveal delay={0.1}>
                <div className="flex items-center gap-4 mb-8">
                  <span className="h-px w-12 bg-primary" />
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
                    DISH PATCH PH // EST. 2026
                  </span>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black leading-[0.8] tracking-tighter uppercase mb-10">
                  Stories <br />
                  <span className="text-primary italic font-medium lowercase">
                    on a
                  </span>{" "}
                  <br />
                  Plate.
                </h1>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="flex flex-col gap-10 items-start">
                  <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-sm">
                    Every dish has a story. We bring yours to life with 
                    professional chefs right in your own space.
                  </p>

                  <div className="flex flex-wrap gap-6 items-center">
                    <Link
                      href="/auth/login"
                      className="group relative flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-primary translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                      <div className="relative bg-secondary text-secondary-foreground px-10 py-5 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 border border-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        Book a Chef <Plus className="w-3 h-3" />
                      </div>
                    </Link>

                    <Link
                      href="/auth/sign-up"
                      className="group flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors"
                    >
                      Cook With Us
                      <span className="h-[1px] w-8 bg-muted-foreground group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 relative h-[60vh] lg:h-[85vh] w-full mt-12 lg:mt-0">
              <div className="absolute inset-0 z-0 bg-primary/5 translate-x-8 translate-y-8" />
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative h-full w-full overflow-hidden shadow-2xl border border-border"
              >
                <img
                  src="/dishpatch-pics/1.jpg"
                  className="w-full h-full object-cover saturate-[1.1] contrast-[1.05] transition-transform duration-[10s] hover:scale-110"
                  alt="Real food, real passion"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ABOUT US: Section contents preserved exactly as requested */}
        <section
          id="about"
          className="py-40 bg-background relative overflow-hidden border-t border-border"
        >
          <div className="mx-auto max-w-6xl px-8">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-3 space-y-12 pr-0 lg:pr-12">
                <Reveal>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-8">
                    About Us
                  </h2>
                  <p className="text-2xl md:text-5xl font-light leading-[1.1] text-foreground italic">
                    DISH-PATCH is a modern culinary system built on three core
                    services: Private Chef Experiences, Culinary Consultancy,
                    and a Gastronomy Commissary.
                  </p>
                </Reveal>
              </div>
              <div className="lg:col-span-2 space-y-8 bg-background p-12 border border-border shadow-2xl relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 border-t border-l border-primary/40" />
                <div className="opacity-60 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    We are not a restaurant.
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    We are not a traditional catering service.
                  </p>
                </div>
                <hr className="border-primary/30" />
                <p className="text-base font-light text-muted-foreground leading-relaxed">
                  We are a culinary system designed to deliver great food in
                  three ways:
                  <span className="text-foreground font-semibold block mt-4 uppercase tracking-tighter italic text-2xl">
                    experience, knowledge, and product.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS: Heartfelt Header */}
        <section
          id="testimonials"
          className="py-32 border-y border-border bg-muted/5"
        >
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-20 flex justify-between items-end">
              <div>
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
                  Shared Moments
                </span>
                <h2 className="text-5xl font-black uppercase tracking-tighter mt-4">
                  Food people love.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {galleryImages.map((src, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="aspect-[3/4] overflow-hidden border border-border group relative bg-muted">
                    <img
                      src={src}
                      alt="Client Experience"
                      className="w-full h-full object-cover transition-all duration-1000 scale-110 group-hover:scale-100 group-hover:rotate-1"
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Quote className="text-white w-5 h-5 drop-shadow-md" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS: Simple Service Journey */}
        <section
          id="how-it-works"
          className="py-32 border-b border-border bg-muted/10"
        >
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-20">
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
                The Process
              </span>
              <h2 className="text-5xl font-black uppercase tracking-tighter mt-4">
                How it happens.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-0 border border-border bg-background shadow-xl">
              {[
                {
                  icon: <Calendar className="w-5 h-5" />,
                  title: "Book",
                  desc: "Pick a date and tell us what you're craving through our simple booking tool.",
                },
                {
                  icon: <Eye className="w-5 h-5" />,
                  title: "Preview",
                  desc: "Meet your chef and see the menu ideas we've put together just for you.",
                },
                {
                  icon: <UtensilsCrossed className="w-5 h-5" />,
                  title: "Execute",
                  desc: "Our chef arrives at your place to turn fresh ingredients into a meal to remember.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-14 group hover:bg-primary/5 transition-colors border-b md:border-b-0 md:border-r last:border-r-0 border-border"
                >
                  <div className="text-primary mb-10 w-12 h-12 flex items-center justify-center bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 rounded-full">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CULINARY GATEWAYS: Side-by-Side Flex Section */}
        {/* SECTION HEADER */}
        <div id="culinary-gallery">
          <div className="container mx-auto px-8 pt-32 pb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-12 bg-primary" />
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
                Explore the System
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              Beyond the <br /> 
              <span className="text-primary italic font-medium lowercase tracking-normal">Private Table.</span>
            </h2>
          </div>

          {/* SIDE-BY-SIDE GATEWAYS */}
          <section className="w-full flex flex-col md:flex-row h-[70vh] md:h-[85vh] border-y border-border bg-background overflow-hidden">
            
            {/* Left Side: Culinary Gallery */}
            <Link 
              href="/culinary_gallery" 
              className="relative flex-1 group overflow-hidden border-b md:border-b-0 md:border-r border-border bg-black"
            >
              {/* Base Image */}
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 group-hover:opacity-60"
                alt="Chef's Gallery"
              />

              {/* The Atmosphere: Constant mask on left, expands to full cover on hover */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/60 to-transparent transition-all duration-700 ease-in-out group-hover:bg-background/90 group-hover:backdrop-blur-sm" />

              <div className="relative z-20 h-full flex flex-col justify-center p-12 md:p-20">
                <div className="max-w-xs space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary">
                    Portfolio
                  </span>
                  <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.8] transition-transform duration-500 group-hover:-translate-y-2">
                    Culinary <br /> Gallery
                  </h3>
                  <div className="overflow-hidden">
                      <p className="text-sm font-light text-muted-foreground leading-relaxed translate-y-full opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        A visual record of our chef's signature works, from seasonal menus to bespoke a la carte creations.
                      </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Enter System</span>
                    <div className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-24" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Right Side: Culinary Products */}
            <Link 
              href="/products" 
              className="relative flex-1 group overflow-hidden bg-black"
            >
              {/* Base Image */}
              <img 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 group-hover:opacity-60"
                alt="Luxury Products"
              />

              {/* The Atmosphere: Constant mask on left, expands to full cover on hover */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/60 to-transparent transition-all duration-700 ease-in-out group-hover:bg-background/90 group-hover:backdrop-blur-sm" />

              <div className="relative z-20 h-full flex flex-col justify-center p-12 md:p-20">
                <div className="max-w-xs space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary">
                    Commissary
                  </span>
                  <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.8] transition-transform duration-500 group-hover:-translate-y-2">
                    Culinary <br /> Products
                  </h3>
                  <div className="overflow-hidden">
                      <p className="text-sm font-light text-muted-foreground leading-relaxed translate-y-full opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        Exclusive pantry staples and luxury ingredients curated by our team for your own kitchen.
                      </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Explore Shop</span>
                    <div className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-24" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        </div>

        {/* READY TO JOIN: "Savor the moment" preserved */}
        <section
          id="gift"
          className="py-36 bg-background relative flex items-center justify-center overflow-hidden"
        >
          <div className="text-center z-10 px-8 relative max-w-5xl mx-auto">
            <div className="absolute top-0 left-0 w-24 h-px bg-primary/30" />
            <div className="absolute top-0 left-0 w-px h-24 bg-primary/30" />
            <div className="absolute bottom-0 right-0 w-24 h-px bg-primary/30" />
            <div className="absolute bottom-0 right-0 w-px h-24 bg-primary/30" />

            <Reveal>
              <div className="relative inline-block mb-12">
                <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full -z-10" />

                <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8]">
                  Savor <br />
                  <span className="text-primary italic font-medium lowercase tracking-normal">
                    the moment.
                  </span>
                </h2>

                <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
                  <span className="text-[10px] font-bold uppercase tracking-[0.8em]">
                    Real Food
                  </span>
                  <Plus className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.8em]">
                    Real People
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link href="/book" className="group relative">
                  <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 shadow-xl shadow-black/20" />
                  <div className="relative h-16 px-16 bg-secondary text-secondary-foreground border border-secondary font-bold text-[11px] uppercase tracking-[0.4em] flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Start Your Story
                  </div>
                </Link>

                <Button
                  asChild
                  variant="ghost"
                  className="h-16 px-20 rounded-none border text-center border-transparent hover:border-border text-foreground hover:text-foreground font-bold text-[11px] uppercase tracking-[0.4em] transition-all"
                >
                  <Link href="/chef-apply" className="flex items-center justify-center gap-3">
                    Partner with Us
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}