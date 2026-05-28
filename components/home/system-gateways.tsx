"use client";

import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";

export default function SystemGatewaysSection() {
  return (
    <div id="culinary-gallery" className="bg-background">
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

      {/* Grid Layout for Gateways */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 border-y border-border bg-background">
        
        {/* 1. Culinary Gallery (Top Left) */}
        <Link 
          href="/gallery" 
          className="relative group h-[50vh] overflow-hidden border-b md:border-b-0 md:border-r border-border bg-black"
        >
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 group-hover:opacity-60"
            alt="Chef's Gallery"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/60 to-transparent transition-all duration-700 group-hover:bg-background/90" />
          <div className="relative z-20 h-full flex flex-col justify-center p-12">
            <div className="max-w-xs space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary">Portfolio</span>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.8] transition-transform duration-500 group-hover:-translate-y-2">
                Culinary <br /> Gallery
              </h3>
              <div className="flex items-center gap-4 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Enter System</span>
                <div className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-24" />
              </div>
            </div>
          </div>
        </Link>

        {/* 2. Culinary Products (Top Right) */}
        <Link 
          href="/products" 
          className="relative group h-[50vh] overflow-hidden border-b md:border-b-0 border-border bg-black"
        >
          <img 
            src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 group-hover:opacity-60"
            alt="Luxury Products"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/60 to-transparent transition-all duration-700 group-hover:bg-background/90" />
          <div className="relative z-20 h-full flex flex-col justify-center p-12">
            <div className="max-w-xs space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary">Commissary</span>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.8] transition-transform duration-500 group-hover:-translate-y-2">
                Culinary <br /> Products
              </h3>
              <div className="flex items-center gap-4 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest">Explore Shop</span>
                <div className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-24" />
              </div>
            </div>
          </div>
        </Link>

        {/* 3. The Stockhouse (Spans Full Width Bottom) */}
        <Link 
          href="/stockhouse" 
          className="col-span-1 md:col-span-2 relative group overflow-hidden bg-muted/30 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between p-12 md:px-20 hover:bg-foreground hover:text-background transition-colors duration-500"
        >
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 text-primary group-hover:text-background transition-colors">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.6em]">Real-Time Data</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.8]">
              The Stockhouse Ledger
            </h3>
            <p className="text-sm font-light text-muted-foreground group-hover:text-background/70 transition-colors pt-2">
              Access our live commissary inventory. View real-time availability, unit tracking, and seasonal allocations directly from our logistics database.
            </p>
          </div>

          <div className="mt-8 md:mt-0 flex items-center gap-6">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] hidden md:block">
              Initialize View
            </span>
            <div className="w-16 h-16 rounded-full border border-border group-hover:border-background/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}