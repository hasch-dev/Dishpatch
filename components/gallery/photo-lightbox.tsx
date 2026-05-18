"use client";

import { motion } from "framer-motion";
import { X, ChefHat, Info } from "lucide-react";

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
      className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-[210] h-12 w-12 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all group"
      >
        <X className="h-8 w-8 group-hover:rotate-90 transition-transform" />
      </button>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
         <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="lg:col-span-3 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-foreground/10"
         >
           <img 
              src={photo.image_url} 
              className="w-full max-h-[80vh] object-contain bg-zinc-900/50" 
              alt={photo.title} 
           />
         </motion.div>

         <div className="lg:col-span-1 space-y-8 text-left">
            <div className="space-y-2">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
                {photo.category || "General"}
              </p>
              <h2 className="text-5xl font-serif italic leading-[0.9]">{photo.title}</h2>
            </div>
            
            <div className="h-px w-full bg-foreground/10" />
            
            <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-40">
                    <Info className="h-3 w-3" />
                    <span className="text-[9px] uppercase tracking-widest font-black">Technical Brief</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {photo.description || "Visual documentation for the Dishpatch culinary system."}
                </p>
            </div>

            <div className="pt-8">
              <div className="flex items-center gap-4 p-4 bg-foreground/[0.03] border border-foreground/5">
                <div className="h-10 w-10 bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-[0.2em] opacity-40">Curated By</p>
                   <p className="text-[10px] font-black uppercase tracking-tighter">
                     {photo.chef?.display_name || "Collective Artisan"}
                   </p>
                </div>
              </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}