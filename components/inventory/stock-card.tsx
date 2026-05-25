"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

function StockBadge({ count }: { count: number }) {
  if (count <= 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Sold Out</span>
      </div>
    );
  }
  if (count <= 10) {
    return (
      <div className="flex items-center gap-2 text-amber-500">
        <Clock className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Limited</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-primary">
      <CheckCircle2 className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Available</span>
    </div>
  );
}

interface StockCardProps {
  name: string;
  currentStock: number;
}

export function StockCard({ name, currentStock }: StockCardProps) {
  return (
    <div className="p-10 border-b md:border-b-0 md:border-r border-border bg-background group hover:bg-muted/10 transition-colors flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start mb-8">
          <StockBadge count={currentStock} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
          {name}
        </h3>
      </div>
      
      <div className="mt-8 flex items-baseline gap-3 overflow-hidden">
        <motion.span 
          key={currentStock}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-light tracking-tighter"
        >
          {Math.max(0, currentStock)}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          Units
        </span>
      </div>
    </div>
  );
}