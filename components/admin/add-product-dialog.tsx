"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Upload, X, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import your new classifications
import { PRODUCT_CLASSIFICATIONS } from "@/constants/product-classifications";

export default function AddProductDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New state to manage the custom currency display
  const [displayPrice, setDisplayPrice] = useState("");

  const supabase = createClient();

  // Custom function to format price with comma and space
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except numbers and a single decimal point
    const cleanValue = e.target.value.replace(/[^\d.]/g, "");
    
    if (!cleanValue) {
      setDisplayPrice("");
      return;
    }

    const parts = cleanValue.split(".");
    // Regex to add a comma AND a space after every thousandth number
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
    
    setDisplayPrice(parts.slice(0, 2).join("."));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    
    // Clean the price back into a raw float for the database
    const rawPriceString = formData.get("price") as string;
    const finalPrice = parseFloat(rawPriceString.replace(/[^\d.]/g, ""));
    
    try {
      if (!file || file.size === 0) throw new Error("Image schematic is required.");
      if (isNaN(finalPrice)) throw new Error("Invalid price value detected.");

      // 1. Upload Image to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw new Error("Asset transmission failed. Check storage permissions.");

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

      // 2. Save to Database
      const { error: dbError } = await supabase.from("products").insert({
        name: formData.get("name"),
        price: finalPrice,
        category: formData.get("category"),
        description: formData.get("description"),
        href: formData.get("href") || "/", 
        image_url: publicUrl,
      });

      // CHANGE THIS LINE to see the real error
      if (dbError) {
        console.error("Supabase Error Details:", dbError); // Check your browser console!
        throw new Error(dbError.message); // This will show the real error in your red box
      }

      window.location.reload(); 
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (!isOpen) return (
    <Button 
      onClick={() => setIsOpen(true)} 
      className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] h-10 px-6 transition-all shadow-lg shadow-primary/20"
    >
      <Plus className="mr-2 h-4 w-4" /> Initialize Asset
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-3xl border border-foreground/10 p-10 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-6 right-6 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="mb-10 border-b border-foreground/10 pb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            New <span className="italic font-serif text-primary">Registry Entry</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Append product data to central database
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Left Column: Data */}
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Asset Designation</label>
              <input name="name" placeholder="E.g., Private Dinner Experience" required className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Value (PHP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">₱</span>
                  <input 
                    name="price" 
                    type="text" 
                    placeholder="0.00" 
                    value={displayPrice}
                    onChange={handlePriceChange}
                    required 
                    className="w-full bg-background border border-foreground/10 p-3 pl-8 text-xs font-mono focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Classification</label>
                <select 
                  name="category" 
                  required 
                  defaultValue=""
                  className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-muted-foreground">SELECT...</option>
                  {PRODUCT_CLASSIFICATIONS.map((classification) => (
                    <option key={classification.id} value={classification.label}>
                      {classification.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground flex items-center gap-2">
                <LinkIcon size={12} /> Routing Path
              </label>
              <input name="href" defaultValue="/" placeholder="/products/target-url" required className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors text-primary" />
            </div>
          </div>
          
          {/* Right Column: Media & Description */}
          <div className="space-y-6 flex flex-col">
            <div className="space-y-1 flex-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Asset Details</label>
              <textarea name="description" placeholder="Enter detailed technical specifications or product description..." className="w-full h-[100px] bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors resize-none custom-scrollbar" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Visual Schematic</label>
              <div className={`relative border-2 border-dashed p-6 text-center transition-all duration-300 flex flex-col items-center justify-center ${selectedFile ? 'border-primary bg-primary/5' : 'border-foreground/10 bg-background hover:border-primary/50'}`}>
                {selectedFile ? (
                  <div className="flex flex-col items-center text-primary">
                    <CheckCircle2 className="mb-2 h-8 w-8" />
                    <p className="text-[10px] font-mono truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-[8px] uppercase mt-1 opacity-70">Ready for transmission</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-6 w-6 opacity-40" />
                    <p className="text-[10px] uppercase font-black tracking-widest">Select Image File</p>
                    <p className="text-[8px] uppercase mt-1 text-muted-foreground">JPEG, PNG, WEBP (Max 5MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  name="image" 
                  required 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {errorMsg && (
             <div className="col-span-1 md:col-span-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">
               WARNING: {errorMsg}
             </div>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            className="col-span-1 md:col-span-2 w-full rounded-none h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-[0.5em] text-xs transition-all mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading Data...
              </span>
            ) : (
              "Finalize Entry"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}