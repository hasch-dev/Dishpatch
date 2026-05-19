"use client";

import { motion } from "framer-motion";

export function GalleryCard({ 
  photo, 
  onClick, 
  isTall 
}: { 
  photo: any; 
  onClick: () => void; 
  isTall?: boolean;
}) {
  return (
    <div className="group cursor-pointer flex flex-col gap-4">
      <div 
        onClick={onClick}
        className="relative overflow-hidden bg-card border border-foreground/5 shadow-sm"
      >
        <div className={`relative w-full ${isTall ? 'aspect-[2/3]' : 'aspect-[4/5]'} overflow-hidden`}>
          <img
            src={photo.image_url}
            alt={photo.title || "Culinary Asset"}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Persistent Text - No longer an overlay */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-foreground/90">
          {photo.title || "Untitled Creation"}
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-4 bg-primary/40" />
          <p className="text-[9px] font-serif italic text-muted-foreground uppercase tracking-widest">
            {photo.description || "Chef’s Selection"}
          </p>
        </div>
      </div>
    </div>
  );
}