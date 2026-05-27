"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductInfoHeaderProps {
  name: string;
  category: string;
  stockStatus: string;
  stockColorClass: string;
  currentStock: number;
}

export default function ProductInfoHeader({ 
  name, 
  category, 
  stockStatus, 
  stockColorClass,
  currentStock 
}: ProductInfoHeaderProps) {
  return (
    <header className="space-y-6 mb-12">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 bg-foreground text-background">
          {category || "Uncategorized"}
        </span>
        
        <span className={cn(
          "text-[9px] font-black uppercase tracking-[0.3em] border px-3 py-1.5 flex items-center gap-2",
          stockColorClass
        )}>
          {stockStatus || "Status Unknown"}
        </span>
        
        {/* High Performance Cached Live Tracker */}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-foreground/10 text-[9px] font-black uppercase tracking-[0.3em] font-mono">
          <span className="text-muted-foreground">Vol:</span>
          <motion.span 
            key={currentStock}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-primary font-bold"
          >
            {Math.max(0, currentStock || 0)}
          </motion.span>
        </div>
      </div>
      
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
        {name}
      </h2>
    </header>
  );
}