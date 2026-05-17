"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddProductDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    
    // 1. Upload Image to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) return alert("Upload failed");

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

    // 2. Save to Database
    const { error: dbError } = await supabase.from("products").insert({
      name: formData.get("name"),
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category"),
      description: formData.get("description"),
      image_url: publicUrl,
    });

    if (!dbError) {
      window.location.reload(); // Refresh to show new product
    }
    setLoading(false);
  };

  if (!isOpen) return (
    <Button onClick={() => setIsOpen(true)} className="rounded-none bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px]">
      <Plus className="mr-2 h-4 w-4" /> Add New Asset
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-2xl border border-primary/20 p-8 shadow-2xl relative">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 opacity-40 hover:opacity-100"><X /></button>
        
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">New <span className="italic font-serif text-primary">Entry</span></h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <input name="name" placeholder="PRODUCT NAME" required className="w-full bg-muted/30 border-b border-foreground/10 p-3 text-xs font-bold uppercase" />
            <input name="price" type="number" step="0.01" placeholder="PRICE ($)" required className="w-full bg-muted/30 border-b border-foreground/10 p-3 text-xs font-bold uppercase" />
            <input name="category" placeholder="CATEGORY" className="w-full bg-muted/30 border-b border-foreground/10 p-3 text-xs font-bold uppercase" />
          </div>
          
          <div className="space-y-4">
            <textarea name="description" placeholder="DESCRIPTION" className="w-full bg-muted/30 border-b border-foreground/10 p-3 text-xs font-bold uppercase h-24" />
            <div className="border-2 border-dashed border-foreground/10 p-4 text-center group hover:border-primary transition-colors relative">
              <Upload className="mx-auto opacity-20 group-hover:opacity-100 transition-opacity" />
              <p className="text-[8px] uppercase font-black mt-2">Upload Schematic (Image)</p>
              <input type="file" name="image" required className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="col-span-2 w-full rounded-none h-12 uppercase font-black tracking-[0.5em]">
            {loading ? "Transmitting..." : "Finalize Entry"}
          </Button>
        </form>
      </div>
    </div>
  );
}