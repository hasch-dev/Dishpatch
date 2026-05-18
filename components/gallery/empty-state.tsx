"use client";

import { ImageIcon } from "lucide-react";

export function GalleryEmptyState() {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center border border-foreground/5 bg-foreground/[0.01]">
      <div className="h-16 w-16 bg-foreground/[0.02] flex items-center justify-center mb-6 rounded-full">
        <ImageIcon className="h-6 w-6 opacity-10" />
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-2">Registry Empty</h3>
      <p className="text-[9px] uppercase tracking-widest opacity-20 max-w-[220px] text-center leading-loose">
        The visual archive is currently being curated. Check back soon for the latest culinary documentation.
      </p>
    </div>
  );
}