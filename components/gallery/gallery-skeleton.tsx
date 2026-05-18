"use client";

import { motion } from "framer-motion";

export function GallerySkeleton() {
  // Create an array of 8 placeholder "ghost" boxes
  const skeletons = Array.from({ length: 8 });

  return (
    <div className="columns-1 md:columns-2 lg:columns-4 gap-8 w-full">
      {skeletons.map((_, i) => (
        <div key={i} className="break-inside-avoid mb-8">
          <div 
            className="w-full bg-foreground/5 animate-pulse rounded-sm border border-foreground/5"
            style={{ 
              height: i % 2 === 0 ? "320px" : "450px", // Varying heights for masonry feel
            }} 
          />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 bg-foreground/5 animate-pulse rounded-none" />
            <div className="h-2 w-1/3 bg-foreground/5 animate-pulse rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}