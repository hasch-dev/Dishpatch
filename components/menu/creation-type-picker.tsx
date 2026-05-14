"use client";

import { Utensils, Layers, X, ArrowRight } from "lucide-react";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
      {/* 
        Stark Backdrop: We use a near-solid dark overlay here instead of a light blur. 
        This completely neutralizes any background clutter and fixes the clashing issue.
      */}
      <div 
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-4xl bg-background border border-border/40 shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 p-2 opacity-40 hover:opacity-100 hover:bg-muted transition-all"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Modal Header */}
        <div className="pt-10 pb-6 px-10 border-b border-border/10 text-center relative overflow-hidden">
          <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-40 mb-3">
            System Initialization
          </p>
          <h2 className="text-4xl font-serif italic tracking-tight">
            Select Creation Typology
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/10">
          
          {/* A La Carte Option */}
          <button 
            onClick={() => onSelect('a_la_carte')}
            className="group relative p-10 md:p-14 flex flex-col text-left hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary inset-ring"
          >
            <div className="h-16 w-16 rounded-none bg-background border border-border/20 flex items-center justify-center mb-8 shadow-sm group-hover:border-primary/50 transition-colors">
              <Utensils className="h-6 w-6 text-foreground opacity-70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            
            <h3 className="font-serif italic text-3xl mb-3 group-hover:text-primary transition-colors">
              A La Carte
            </h3>
            
            <p className="text-sm opacity-60 leading-relaxed mb-8 pr-4">
              A standalone culinary entity. Choose this pathway to define individual dishes, document their distinct ingredient profiles, and establish specific pricing tiers independent of a larger sequence.
            </p>

            <div className="mt-auto flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              Initialize Item <ArrowRight size={12} />
            </div>
          </button>

          {/* Grouped Menu Option */}
          <button 
            onClick={() => onSelect('grouped_menu')}
            className="group relative p-10 md:p-14 flex flex-col text-left hover:bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary inset-ring"
          >
            <div className="h-16 w-16 rounded-none bg-background border border-border/20 flex items-center justify-center mb-8 shadow-sm group-hover:border-primary/50 transition-colors">
              <Layers className="h-6 w-6 text-foreground opacity-70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            
            <h3 className="font-serif italic text-3xl mb-3 group-hover:text-primary transition-colors">
              Curated Menu
            </h3>
            
            <p className="text-sm opacity-60 leading-relaxed mb-8 pr-4">
              A multi-course narrative. Select this to construct a sequential dining experience, linking existing a la carte items together under a unified thematic banner and a consolidated price point.
            </p>

            <div className="mt-auto flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              Initialize Sequence <ArrowRight size={12} />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}