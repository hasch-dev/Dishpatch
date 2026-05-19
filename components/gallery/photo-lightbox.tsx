"use client";

import { motion } from "framer-motion";
import { X, Fingerprint } from "lucide-react";

interface PhotoLightboxProps {
  photo: any;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  if (!photo) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-2xl flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Absolute Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[210] h-12 w-12 flex items-center justify-center bg-background/50 hover:bg-foreground/10 border border-foreground/10 rounded-full backdrop-blur-md transition-all group"
      >
        <X className="h-5 w-5 text-foreground group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Image Stage (Left/Top) */}
      <div className="flex-1 h-[60vh] lg:h-full p-8 md:p-16 flex items-center justify-center relative relative group">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img 
            src={photo.image_url} 
            className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-[0_0_40px_rgba(0,0,0,0.2)]" 
            alt={photo.title} 
          />
        </motion.div>
      </div>

      {/* Editorial Sidebar (Right/Bottom) */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        className="w-full lg:w-[450px] xl:w-[500px] h-[40vh] lg:h-full bg-foreground/[0.02] border-t lg:border-t-0 lg:border-l border-foreground/10 p-8 lg:p-16 flex flex-col justify-center relative overflow-y-auto"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />

        <div className="space-y-8">
          {/* Title Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 opacity-40">
              <Fingerprint className="h-3 w-3" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black">Asset Identity</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic tracking-tight leading-[0.9]">
              {photo.title || "Untitled"}
            </h2>
          </div>
          
          <div className="h-px w-12 bg-foreground/20" />
          
          {/* Description Area */}
          <div className="space-y-3">
             <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
               Description
             </h3>
             <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light">
               {photo.description || "No visual documentation or brief provided for this asset."}
             </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}