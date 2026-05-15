"use client";

import { Utensils, Layers, X, ArrowRight, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreationTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'a_la_carte' | 'grouped_menu') => void;
}

export default function CreationTypePicker({ 
  isOpen, 
  onClose, 
  onSelect 
}: CreationTypePickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-background border border-border/40 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Corner Decorative Elements */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-primary/20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-primary/20 pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 z-20 p-2 opacity-30 hover:opacity-100 transition-all hover:rotate-90"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Header Area */}
            <div className="pt-16 pb-10 px-12 text-center relative">
              <div className="flex items-center justify-center gap-3 mb-4 opacity-40">
                <div className="h-[1px] w-8 bg-foreground" />
                <p className="text-[10px] uppercase font-bold tracking-[0.5em]">System_Initialization</p>
                <div className="h-[1px] w-8 bg-foreground" />
              </div>
              <h2 className="text-5xl font-serif italic tracking-tighter leading-none">
                Define Creation Typology
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 relative border-t border-border/10">
              {/* Central Technical Crosshair */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-4">
                <div className="h-24 w-[1px] bg-border/20" />
                <div className="h-2 w-2 rounded-full border border-primary/40 bg-background" />
                <div className="h-24 w-[1px] bg-border/20" />
              </div>

              {/* A La Carte Pathway */}
              <button 
                onClick={() => onSelect('a_la_carte')}
                className="group relative p-12 md:p-20 flex flex-col text-left transition-all duration-500 hover:bg-primary/[0.02]"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-[10px] opacity-20 group-hover:opacity-100 transition-opacity">01_ENTITY</span>
                  <div className="h-14 w-14 border border-border/20 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] transition-all">
                    <Utensils className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="font-serif italic text-4xl mb-4 transition-transform group-hover:translate-x-2 duration-500">
                  A La Carte
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-10 pr-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  Define a standalone culinary entity. Architect the ingredient manifest, document distinct provenance, and establish targeted pricing tiers for individual dishes.
                </p>

                <div className="mt-auto flex items-center gap-3 text-[9px] uppercase font-black tracking-[0.3em] text-primary transition-all overflow-hidden h-4">
                   <div className="flex flex-col group-hover:-translate-y-4 transition-transform duration-500">
                      <span className="flex items-center gap-2">Initialize Item <ArrowRight size={10} /></span>
                      <span className="flex items-center gap-2">Deploy Manifest <ArrowRight size={10} /></span>
                   </div>
                </div>
              </button>

              {/* Grouped Menu Pathway */}
              <button 
                onClick={() => onSelect('grouped_menu')}
                className="group relative p-12 md:p-20 flex flex-col text-left transition-all duration-500 hover:bg-primary/[0.02] border-t md:border-t-0 md:border-l border-border/10"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-[10px] opacity-20 group-hover:opacity-100 transition-opacity">02_ASSEMBLY</span>
                  <div className="h-14 w-14 border border-border/20 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] transition-all">
                    <Layers className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="font-serif italic text-4xl mb-4 transition-transform group-hover:translate-x-2 duration-500">
                  Curated Assembly
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-10 pr-6 opacity-60 group-hover:opacity-100 transition-opacity">
                   Orchestrate a sequential multi-course experience. Link existing archive records into a unified thematic narrative with a consolidated valuation strategy.
                </p>

                <div className="mt-auto flex items-center gap-3 text-[9px] uppercase font-black tracking-[0.3em] text-primary transition-all overflow-hidden h-4">
                   <div className="flex flex-col group-hover:-translate-y-4 transition-transform duration-500">
                      <span className="flex items-center gap-2">Initialize Sequence <ArrowRight size={10} /></span>
                      <span className="flex items-center gap-2">Launch Assembly <ArrowRight size={10} /></span>
                   </div>
                </div>
              </button>
            </div>

            {/* System Status Footer */}
            <div className="bg-muted/30 p-4 border-t border-border/10 flex justify-center items-center gap-8">
               <div className="flex items-center gap-2 opacity-20">
                  <div className="h-1 w-1 bg-foreground rounded-full animate-pulse" />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Awaiting_Input</span>
               </div>
               <div className="h-3 w-[1px] bg-border/40" />
               <div className="flex items-center gap-2 opacity-20">
                  <Fingerprint size={10} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Secure_Archive_Access</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}