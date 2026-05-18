"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence } from "framer-motion";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton";
import { GalleryEmptyState } from "@/components/gallery/empty-state";
import FloatingNav from "@/components/navigation/floating-nav";

export default function GalleryPage() {
  const supabase = createClient();
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) console.error("Gallery Sync Error:", error.message);
      if (data) setPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-black overflow-x-hidden">
      
      <FloatingNav />
      
      <main className="w-full px-6 md:px-12 lg:px-20 pt-32 pb-32">
        <header className="mb-20 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            The <span className="text-primary italic font-serif">Portfolio</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-4 ml-1">
            Visual Registry of Private Dining Experiences
          </p>
        </header>

        {loading ? (
          <GallerySkeleton />
        ) : photos.length > 0 ? (
          <div className="animate-in fade-in duration-1000">
             <MasonryGrid photos={photos} onSelectPhoto={setSelectedPhoto} />
          </div>
        ) : (
          <GalleryEmptyState />
        )}
      </main>

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoLightbox 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}