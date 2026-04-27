"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Sun, Moon } from "lucide-react";
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
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 antialiased">
      <Navbar />

      <main>
        {/* HERO: LOGISTICAL FOCUS */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-40">
          <div className="max-w-4xl">
            <Reveal>
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em]">
                Integrated Gastronomy System
              </span>
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.8] mt-6 uppercase">
                Professional <br />
                <span className="text-primary italic font-medium">
                  Culinary
                </span>{" "}
                <br />
                Logistics.
              </h1>
              <p className="mt-12 text-xl font-light text-muted-foreground max-w-2xl leading-relaxed">
                Dishpatch connects professional operators with private
                infrastructure. We manage the sourcing, production, and
                restoration of your kitchen environment.
              </p>
              <div className="mt-12 flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-secondary text-secondary-foreground h-14 px-10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary"
                >
                  <Link href="/auth/sign-up">Request Access</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* THE SYSTEM (REPLACING THE SERVICE) */}
        <section
          id="experience"
          className="py-24 border-y border-border bg-secondary text-secondary-foreground"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  label: "01 / Sourcing",
                  title: "Curated Supply Chain",
                  desc: "Direct access to artisan producers and professional-grade ingredients.",
                },
                {
                  label: "02 / Operation",
                  title: "On-Site Execution",
                  desc: "Qualified culinary specialists managing your kitchen from prep to service.",
                },
                {
                  label: "03 / Restoration",
                  title: "Zero-Impact Cleanup",
                  desc: "Environment left in original condition. Total professional discretion.",
                },
              ].map((step, i) => (
                <div key={i} className="space-y-6">
                  <span className="text-primary font-bold text-[10px] uppercase tracking-widest">
                    {step.label}
                  </span>
                  <h3 className="text-2xl font-bold uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-secondary-foreground/60 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT US (UNCHANGED CONTENT, REFINED STYLE) */}
        <section id="about" className="py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="bg-muted aspect-video relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2000"
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Kitchen Operation"
                />
              </div>
              <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                  About the System
                </span>
                <p className="text-2xl font-light leading-relaxed">
                  DISH-PATCH is a modern culinary system built on three core
                  services:{" "}
                  <span className="font-bold">Private Chef Experiences</span>,{" "}
                  <span className="font-bold">Culinary Consultancy</span>, and a{" "}
                  <span className="font-bold">Gastronomy Commissary</span>.
                </p>
                <p className="text-muted-foreground font-light italic">
                  We are a culinary system designed to deliver value in three
                  ways: experience, knowledge, and product.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS (EDITORIAL GRID) */}
        <section id="testimonials" className="py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="columns-1 md:columns-3 gap-8 space-y-8">
              {[
                {
                  img: "https://images.unsplash.com/photo-1550966841-3ee5ad60b051?q=80&w=800",
                  text: "Systematic approach to dining. Impressive results.",
                  user: "Julianne V.",
                },
                {
                  img: "https://images.unsplash.com/photo-1528605248644-14dd04322a11?q=80&w=800",
                  text: "Professional execution from start to finish.",
                  user: "Marcus K.",
                },
                {
                  img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800",
                  text: "Total reliability for complex hosting requirements.",
                  user: "Sarah L.",
                },
              ].map((item, i) => (
                <div key={i} className="break-inside-avoid space-y-4">
                  <img
                    src={item.img}
                    className="w-full grayscale brightness-75"
                    alt="Service Result"
                  />
                  <p className="text-sm font-serif italic">"{item.text}"</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                    — {item.user}
                  </p>
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
