"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Image as ImageIcon, Star, Home, PackageOpen, Sun, Moon, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [chefs, setChefs] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedChef, setSelectedChef] = useState<any | null>(null);
  const [chefMenu, setChefMenu] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for theme toggle
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchData = async () => {
      // Logic Fix: Query profiles where user_type is 'chef' OR is_chef is true
      const { data: chefData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .or('user_type.eq.chef,is_chef.eq.true');
      
      if (profileError) console.error("Profile Fetch Error:", profileError);
      
      if (chefData && chefData.length > 0) {
        const chefIds = chefData.map(c => c.id);
        const { data: detailsData } = await supabase
          .from("chef_details")
          .select("*")
          .in("id", chefIds);
        
        const mergedChefs = chefData.map(chef => {
          const details = detailsData?.find(d => d.id === chef.id) || {};
          return { ...chef, details };
        });
        setChefs(mergedChefs);
      }

      const { data: photoData } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (photoData) setPhotos(photoData);
    };
    fetchData();
  }, [supabase]);

  const handleChefClick = async (chef: any) => {
    setSelectedChef(chef);
    const { data } = await supabase
      .from("chef_catalog_items")
      .select("*")
      .eq("chef_id", chef.id);
    setChefMenu(data || []);
  };

  return (
    <div className="min-h-screen bg-background font-sans relative transition-colors duration-500">
      
      {/* MINIMALIST FLOATING DOCK */}
      <motion.div 
        initial={{ y: 100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        className="fixed bottom-8 left-1/2 z-[100] flex items-center gap-1 p-2 bg-background/60 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl"
      >
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/gallery">
          <Button variant="ghost" size="icon" className="rounded-xl bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
            <PackageOpen className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </motion.div>

      <div className="container mx-auto px-6 pt-20 pb-12">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4 opacity-50">
            <Utensils className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">The Artisans</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Culinary <span className="text-primary italic font-medium lowercase tracking-normal">Minds.</span>
          </h1>
        </header>

        {/* CHEF SELECTION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {chefs.length > 0 ? (
            chefs.map((chef) => (
              <motion.button 
                whileHover={{ y: -4 }}
                key={chef.id}
                onClick={() => handleChefClick(chef)}
                className="group flex flex-col border border-border p-8 bg-card/40 hover:border-primary transition-all text-left relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-24 w-24 rounded-full border border-border group-hover:border-primary overflow-hidden bg-muted transition-colors">
                    {chef.chef_image_url ? (
                      <img src={chef.chef_image_url} className="w-full h-full object-cover" alt={chef.display_name} />
                    ) : (
                      <ChefHat className="h-10 w-10 m-auto mt-7 text-muted-foreground" />
                    )}
                  </div>
                  {chef.details?.rating > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                      <Star className="h-3 w-3 fill-current" /> {chef.details.rating}
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2">
                    {chef.details?.chef_title || chef.specialty || "Chef"}
                  </p>
                  <h3 className="text-3xl font-serif italic text-foreground leading-none">
                    {chef.display_name}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chef.details?.cuisine_types?.slice(0, 2).map((c: string) => (
                      <span key={c} className="text-[8px] uppercase tracking-widest border border-border px-2 py-0.5 opacity-60">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full py-20 border-2 border-dashed border-border flex flex-col items-center justify-center opacity-40 rounded-3xl">
              <ChefHat className="h-12 w-12 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Chef Profiles Found</p>
              <p className="text-[9px] mt-2 opacity-60">Verify your database has user_type='chef' or is_chef=true</p>
            </div>
          )}
        </div>

        {/* GALLERY GRID */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pb-32">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid border border-border bg-card group relative overflow-hidden rounded-sm">
              <img 
                src={photo.image_url} 
                alt={photo.title}
                className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold mb-1">{photo.category}</span>
                <h4 className="text-xl font-serif italic text-white leading-none">{photo.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL-SCREEN OVERLAY */}
      <AnimatePresence>
        {selectedChef && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background/98 backdrop-blur-xl flex flex-col"
          >
            <div className="p-8 flex justify-between items-center border-b border-border">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 rounded-full border border-border overflow-hidden hidden md:block">
                   <img src={selectedChef.chef_image_url} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Artisan Profile</span>
                    <h2 className="text-4xl font-serif italic">{selectedChef.display_name}</h2>
                 </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedChef(null)} className="rounded-full hover:bg-destructive/10">
                <X className="h-10 w-10" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 pb-20">
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 border-b border-border pb-4">Chef Catalog</h3>
                   <div className="space-y-10">
                     {chefMenu.map(item => (
                       <div key={item.id} className="group">
                         <div className="flex justify-between items-baseline mb-3">
                           <h4 className="text-xl font-bold uppercase tracking-tighter group-hover:text-primary transition-colors">{item.name}</h4>
                           <span className="font-mono text-sm text-primary font-bold">${item.price}</span>
                         </div>
                         <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.description}</p>
                       </div>
                     ))}
                   </div>
                </div>
                
                <div className="space-y-12">
                   <div className="bg-sidebar p-8 border border-border">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Details</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between text-xs border-b border-border pb-2">
                           <span className="opacity-50">Experience</span>
                           <span>{selectedChef.details?.experience_years} Years</span>
                         </div>
                         <div className="flex justify-between text-xs border-b border-border pb-2">
                           <span className="opacity-50">Consultation</span>
                           <span className={selectedChef.details?.offers_consultation ? "text-green-500" : ""}>
                             {selectedChef.details?.offers_consultation ? "Available" : "No"}
                           </span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}