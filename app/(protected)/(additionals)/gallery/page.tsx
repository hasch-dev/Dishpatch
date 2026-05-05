"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  const supabase = createClient();
  const [chefs, setChefs] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedChef, setSelectedChef] = useState<any | null>(null);
  const [chefMenu, setChefMenu] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Chefs
      const { data: chefData } = await supabase.from("profiles").select("*").eq("user_type", "chef");
      if (chefData) setChefs(chefData);

      // Fetch from your existing gallery_items table
      const { data: photoData } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
      if (photoData) setPhotos(photoData);
    };
    fetchData();
  }, [supabase]);

  // Fetch menu when a chef is clicked
  const handleChefClick = async (chef: any) => {
    setSelectedChef(chef);
    const { data } = await supabase.from("menu_items").select("*").eq("chef_id", chef.id);
    setChefMenu(data || []);
  };

  const groupedMenu = chefMenu.filter(m => m.category !== 'A La Carte');
  const aLaCarteMenu = chefMenu.filter(m => m.category === 'A La Carte');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* HEADER SECTION */}
      <div className="container mx-auto px-4 md:px-8 pt-24 pb-12">
        <div className="flex items-center gap-4 mb-4">
          <span className="h-px w-12 bg-primary" />
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">The Artisans</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-12">
          Culinary <span className="text-primary italic font-medium lowercase tracking-normal">Minds.</span>
        </h1>

        {/* CHEF SELECTION ROW */}
        <div className="flex overflow-x-auto custom-scrollbar gap-6 pb-6 snap-x">
          {chefs.map((chef) => (
            <button 
              key={chef.id}
              onClick={() => handleChefClick(chef)}
              className="group snap-start shrink-0 flex items-center gap-4 border border-border p-4 hover:border-primary transition-colors min-w-[280px] bg-sidebar"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                {chef.avatar_url ? (
                  <img src={chef.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <ChefHat className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold mb-1">View Catalog</p>
                <h3 className="text-sm font-serif italic text-foreground tracking-wide group-hover:text-primary transition-colors">
                  Chef {chef.display_name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FULL PAGE IMAGE GALLERY (Using existing gallery_items) */}
      <div className="border-t border-border bg-sidebar pt-12 pb-24">
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Dispatched Moments
          </h2>
        </div>
        
        <div className="container mx-auto px-4 md:px-8 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid relative group overflow-hidden border border-border bg-black">
              <img 
                src={photo.image_url} 
                alt={photo.title || "Gallery image"}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">{photo.title}</h4>
                {photo.description && (
                  <p className="text-xs font-light text-foreground mt-1 line-clamp-2">{photo.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <p className="text-center text-muted-foreground text-xs uppercase tracking-widest my-24">
            No moments captured yet.
          </p>
        )}
      </div>

      {/* CHEF CATALOG MODAL */}
      <AnimatePresence>
        {selectedChef && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 md:p-8"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-card border border-border w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-border bg-sidebar shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Catalog Preview</span>
                  <h2 className="text-3xl font-serif italic text-foreground mt-1">Chef {selectedChef.display_name}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedChef(null)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Modal Content - Two Columns */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Column 1: Grouped Menus */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-border pb-4 mb-6 text-foreground flex items-center gap-2">
                    Tasting & Grouped Menus
                  </h3>
                  <div className="space-y-6">
                    {groupedMenu.map(item => (
                      <div key={item.id} className="group">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="text-sm font-bold uppercase tracking-widest">{item.name}</h4>
                          {item.price && <span className="font-mono text-xs text-primary">${item.price}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                    {groupedMenu.length === 0 && <p className="text-xs italic text-muted-foreground">No grouped menus available.</p>}
                  </div>
                </div>

                {/* Column 2: A La Carte */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-border pb-4 mb-6 text-foreground flex items-center gap-2">
                    A La Carte Enhancements
                  </h3>
                  <div className="space-y-6">
                    {aLaCarteMenu.map(item => (
                      <div key={item.id} className="group">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="text-sm font-bold uppercase tracking-widest">{item.name}</h4>
                          {item.price && <span className="font-mono text-xs text-primary">${item.price}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                    {aLaCarteMenu.length === 0 && <p className="text-xs italic text-muted-foreground">No a la carte options available.</p>}
                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-sidebar shrink-0 flex justify-end">
                <Button 
                  className="rounded-none uppercase tracking-[0.2em] font-bold text-[10px] px-8"
                  onClick={() => setSelectedChef(null)}
                >
                  Close Catalog
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}