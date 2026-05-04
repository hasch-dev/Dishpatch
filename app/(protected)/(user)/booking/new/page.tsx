"use client";

import { useState } from "react";
import PrivateEventForm from "@/components/private-event-form";
import ConsultationForm from "@/components/consultation-form";
import { Sparkles, Briefcase, ChevronRight } from "lucide-react";

export default function NewBookingPage() {
  const [bookingType, setBookingType] = useState<"Private Event" | "Consultation" | null>(null);

  if (bookingType === "Private Event") return <PrivateEventForm onBack={() => setBookingType(null)} />;
  if (bookingType === "Consultation") return <ConsultationForm onBack={() => setBookingType(null)} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500 w-full bg-background text-foreground">
      <div className="text-center space-y-4 mb-16">
        <p className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] animate-in slide-in-from-bottom-2 duration-700">
          Dishpatch Artisan Network
        </p>
        <h1 className="text-5xl md:text-7xl font-serif italic tracking-tighter">
          Select <span className="text-primary not-italic">Pathway</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Private Event */}
        <button 
          onClick={() => setBookingType("Private Event")}
          className="group relative flex flex-col items-start justify-end p-10 h-[450px] border border-border bg-card hover:border-primary transition-all duration-300 ease-out overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkles className="h-10 w-10 text-muted-foreground group-hover:text-primary mb-6 transition-transform duration-500 group-hover:-translate-y-2" />
          <h2 className="text-4xl font-serif italic mb-4 relative z-10">Private Event</h2>
          <p className="text-sm text-muted-foreground text-left max-w-xs relative z-10 leading-relaxed group-hover:text-foreground transition-colors">
            Curated culinary experiences for intimate gatherings, weddings, and exclusive private dining.
          </p>
          <div className="mt-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
            Begin Inquiry <ChevronRight className="ml-2 w-3 h-3" />
          </div>
        </button>

        {/* Consultation */}
        <button 
          onClick={() => setBookingType("Consultation")}
          className="group relative flex flex-col items-start justify-end p-10 h-[450px] border border-border bg-card hover:border-primary transition-all duration-300 ease-out overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Briefcase className="h-10 w-10 text-muted-foreground group-hover:text-primary mb-6 transition-transform duration-500 group-hover:-translate-y-2" />
          <h2 className="text-4xl font-serif italic mb-4 relative z-10">Consultation</h2>
          <p className="text-sm text-muted-foreground text-left max-w-xs relative z-10 leading-relaxed group-hover:text-foreground transition-colors">
            Professional kitchen audits, menu engineering, and F&B business strategy for established brands.
          </p>
          <div className="mt-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
            Begin Consultation <ChevronRight className="ml-2 w-3 h-3" />
          </div>
        </button>
      </div>
    </div>
  );
}