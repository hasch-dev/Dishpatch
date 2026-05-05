"use client";
import Link from "next/link";
import { Utensils, Presentation } from "lucide-react";

export default function BookingSelectionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-12 text-center">
        <header className="space-y-4">
          <h1 className="text-[10px] uppercase tracking-[0.8em] font-bold text-primary opacity-50">
            Booking Engine
          </h1>
          <h2 className="text-4xl md:text-5xl font-serif">How would you like to proceed?</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Private Event Card */}
          <Link 
            href="/booking/private"
            className="group relative border border-border p-12 flex flex-col items-center gap-8 hover:border-primary transition-all duration-500"
          >
            <div className="p-6 rounded-full bg-background group-hover:bg-primary border-1 group-hover:text-background transition-colors">
              <Utensils size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif">Private Event</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-50 leading-relaxed">
                Intimate dinners, celebrations, and curated culinary experiences.
              </p>
            </div>
          </Link>

          {/* Consultation Card */}
          <Link 
            href="/booking/consultation"
            className="group relative border border-border p-12 flex flex-col items-center gap-8 hover:border-primary transition-all duration-500"
          >
            <div className="p-6 rounded-full bg-background group-hover:bg-primary border-1 group-hover:text-background transition-colors">
              <Presentation size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif">Consultation</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-50 leading-relaxed">
                Concept development, menu engineering, and F&B strategy.
              </p>
            </div>
          </Link>
        </div>

        <footer className="pt-12">
          <button 
            onClick={() => window.history.back()}
            className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity"
          >
            Back to Home
          </button>
        </footer>
      </div>
    </div>
  );
}