"use client";

import { Utensils, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreationTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  // This ensures only your defined menu types can be selected
  onSelect: (type: 'a_la_carte' | 'grouped_menu') => void;
}

export default function CreationTypePicker({ 
  isOpen, 
  onClose, 
  onSelect 
}: CreationTypePickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border/40 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity">
          <X size={20} />
        </button>
        
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/10">
          {/* A La Carte Option */}
          <button 
            onClick={() => onSelect('a_la_carte')}
            className="p-12 flex flex-col items-center text-center group hover:bg-primary/5 transition-all"
          >
            <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-serif italic text-2xl mb-2">A La Carte</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Standalone Culinary Work</p>
          </button>

          {/* Grouped Menu Option */}
          <button 
            onClick={() => onSelect('grouped_menu')}
            className="p-12 flex flex-col items-center text-center group hover:bg-primary/5 transition-all"
          >
            <div className="h-16 w-16 bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="font-serif italic text-2xl mb-2">Grouped Menu</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Curated Multi-Course Logic</p>
          </button>
        </div>
      </div>
    </div>
  );
}