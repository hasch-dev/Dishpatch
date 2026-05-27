"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  onClick: () => void;
  resolveImageUrl: (path: string | null) => string | null;
  getStockColor: (status: string) => string;
}

export function ProductCard({ product, onClick, resolveImageUrl, getStockColor }: ProductCardProps) {
  const imageUrl = resolveImageUrl(product.image_url);
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col h-full"
    >
      {/* Visual Frame Wrapper */}
      <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden relative border border-foreground/5 group-hover:border-foreground/20 transition-colors">
        {imageUrl ? (
          <>
            <Image 
              src={imageUrl} 
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={product.is_featured}
              className="object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 font-serif italic text-2xl">
            No Media
          </div>
        )}
        
        {/* Dynamic Status Badge */}
        <div className={cn(
          "absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm border z-10",
          getStockColor(product.stock_status)
        )}>
          {product.stock_status || "Unknown"}
        </div>
      </div>
      
      {/* Metadata Typography Stack */}
      <div className="space-y-2 flex-1 flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
          {product.category || "Uncategorized"}
        </span>
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {product.name}
          </h4>
        </div>
        
        {/* Pricing & Realtime Cached Volumes */}
        <div className="mt-auto pt-4 flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="font-serif italic text-xl text-muted-foreground group-hover:text-foreground transition-colors">
              ${Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
              <motion.span 
                key={product.current_stock}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xs font-bold font-mono text-foreground"
              >
                {Math.max(0, product.current_stock || 0)}
              </motion.span>
              <span className="text-[8px] uppercase tracking-widest font-mono">Units Available</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
        </div>
      </div>
    </motion.div>
  );
}