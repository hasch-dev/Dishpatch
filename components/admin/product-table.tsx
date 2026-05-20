"use client";

import { useState, useEffect } from "react";
import ProductActions from "./product-actions";
import { EyeOff, X, Upload, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// Import your custom classifications to ensure drop-down syncing
import { PRODUCT_CLASSIFICATIONS } from "@/constants/product-classifications";

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showHidden, setShowHidden] = useState(false);
  
  // Editorial Modal States
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayPrice, setDisplayPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  // Parse and prep price string whenever an asset is opened for editing
  useEffect(() => {
    if (editingProduct?.price !== undefined) {
      const rawPrice = String(editingProduct.price);
      formatAndSetDisplayPrice(rawPrice);
    } else {
      setDisplayPrice("");
    }
  }, [editingProduct?.id]);

  const formatAndSetDisplayPrice = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    if (!cleanValue) {
      setDisplayPrice("");
      return;
    }
    const parts = cleanValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
    setDisplayPrice(parts.slice(0, 2).join("."));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formatAndSetDisplayPrice(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleItemUpdate = (productId: string, updates: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const handleItemDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    setErrorMsg(null);

    // Reconstruct clean database values
    const finalPrice = parseFloat(displayPrice.replace(/[^\d.]/g, ""));
    
    try {
      if (isNaN(finalPrice)) throw new Error("Invalid pricing structure metric detected.");

      let currentImageUrl = editingProduct.image_url;

      // 1. Process New Schematic Media if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, selectedFile);

        if (uploadError) throw new Error("Asset transmission failed. Verify bucket policies.");

        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        currentImageUrl = publicUrl;
      }

      // 2. Perform Atomic Update Transaction
      const updatedFields = {
        name: editingProduct.name,
        price: finalPrice,
        category: editingProduct.category,
        description: editingProduct.description,
        href: editingProduct.href || "/",
        stock_status: editingProduct.stock_status,
        is_hidden: editingProduct.is_hidden,
        image_url: currentImageUrl
      };

      const { error: dbError } = await supabase
        .from("products")
        .update(updatedFields)
        .eq("id", editingProduct.id);

      if (dbError) throw new Error(dbError.message);

      // 3. Update Client State dynamically without hard-refreshing
      handleItemUpdate(editingProduct.id, updatedFields);
      
      // Close Drawer & Reset Context
      setEditingProduct(null);
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Registry Mutation Error:", err);
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = showHidden 
    ? products 
    : products.filter(p => !p.is_hidden);

  return (
    <div className="w-full relative">
      <div className="p-4 border-b border-foreground/5 flex justify-end bg-foreground/[0.01]">
        <button 
          onClick={() => setShowHidden(!showHidden)}
          className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            showHidden ? "text-primary opacity-100" : "opacity-60 hover:opacity-100"
          }`}
        >
          <EyeOff size={12} /> {showHidden ? "Hide Inactive" : "Show Hidden Assets"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-foreground/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-foreground/[0.01]">
              <th className="p-6">Status</th>
              <th className="p-6">Asset Name</th>
              <th className="p-6">Category</th>
              <th className="p-6 text-right">Price</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {filteredProducts.map((product) => (
              <tr 
                key={product.id} 
                className={`group hover:bg-foreground/[0.01] transition-colors ${
                  product.is_hidden ? 'opacity-40 grayscale bg-foreground/[0.01]' : ''
                }`}
              >
                <td className="p-6">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${
                       product.stock_status === 'in_stock' ? 'bg-green-500' : 
                       product.stock_status === 'low_stock' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]' : 'bg-red-500'
                     }`} />
                     <span className="text-[9px] font-mono uppercase tracking-tighter opacity-60">
                       {product.stock_status?.replace('_', ' ')}
                     </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-tight">{product.name}</span>
                    <span className="text-[9px] font-mono opacity-40 truncate max-w-[180px] mt-0.5">{product.id}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-[10px] font-black uppercase border border-foreground/10 px-2 py-1 bg-background">
                    {product.category || "General"}
                  </span>
                </td>
                <td className="p-6 text-right font-mono text-xs">
                  ₱ {product.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-6 text-right">
                  <ProductActions 
                    product={product} 
                    onUpdate={(updates) => handleItemUpdate(product.id, updates)} 
                    onDelete={() => handleItemDelete(product.id)}
                    onEditTrigger={() => {
                      setErrorMsg(null);
                      setSelectedFile(null);
                      setEditingProduct({ ...product });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Advanced Component Blueprint Update Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl border border-foreground/10 p-10 shadow-2xl relative overflow-hidden">
            
            <button 
              type="button"
              onClick={() => { setEditingProduct(null); setSelectedFile(null); }} 
              className="absolute top-6 right-6 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="mb-8 border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Modify <span className="italic font-serif text-primary">Asset Configuration</span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-1">
                UUID Ref: {editingProduct.id}
              </p>
            </div>
            
            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              {/* Left Column Data Controls */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Asset Designation</label>
                  <input 
                    type="text"
                    required
                    value={editingProduct.name || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono uppercase font-bold focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Value (PHP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">₱</span>
                      <input 
                        type="text" 
                        required 
                        value={displayPrice}
                        onChange={handlePriceChange}
                        className="w-full bg-background border border-foreground/10 p-3 pl-8 text-xs font-mono focus:outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Classification</label>
                    <select 
                      value={editingProduct.category || ""} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      required
                      className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>SELECT...</option>
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
                  <input 
                    type="text"
                    required
                    value={editingProduct.href || "/"} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, href: e.target.value })}
                    className="w-full bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors text-primary" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Stock Allocation</label>
                    <select
                      value={editingProduct.stock_status || "in_stock"}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value })}
                      className="w-full bg-background border border-foreground/10 p-2.5 text-xs font-mono focus:outline-none focus:border-primary uppercase cursor-pointer"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-2 pl-1">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="edit-is-hidden"
                        checked={editingProduct.is_hidden || false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_hidden: e.target.checked })}
                        className="h-3.5 w-3.5 accent-foreground cursor-pointer"
                      />
                      <label htmlFor="edit-is-hidden" className="text-[9px] font-black uppercase tracking-wider cursor-pointer opacity-70 select-none">
                        Hide Registry Entry
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column Media Controls */}
              <div className="space-y-4 flex flex-col">
                <div className="space-y-1 flex-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Asset Details</label>
                  <textarea 
                    value={editingProduct.description || ""} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full h-[95px] bg-background border border-foreground/10 p-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors resize-none custom-scrollbar" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">Update Visual Schematic</label>
                  <div className={`relative border-2 border-dashed p-4 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[115px] ${selectedFile ? 'border-primary bg-primary/5' : 'border-foreground/10 bg-background hover:border-primary/50'}`}>
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-primary">
                        <CheckCircle2 className="mb-1 h-6 w-6" />
                        <p className="text-[9px] font-mono truncate max-w-[220px] font-bold">{selectedFile.name}</p>
                        <p className="text-[8px] uppercase tracking-wider opacity-70">Replaces current visual map</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center group-hover:opacity-100">
                        {editingProduct.image_url ? (
                          <div className="flex items-center gap-3 w-full px-2">
                            <img 
                              src={editingProduct.image_url} 
                              alt="Current asset layout preview" 
                              className="h-12 w-12 object-cover border border-foreground/10 grayscale group-hover:grayscale-0 transition-all"
                            />
                            <div className="text-left">
                              <p className="text-[9px] font-black uppercase tracking-wider">Modify Existing File</p>
                              <p className="text-[8px] text-muted-foreground uppercase">Click or drop image file to rewrite</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="mb-1 h-5 w-5 opacity-40" />
                            <p className="text-[9px] uppercase font-black tracking-widest">Upload New Asset Image</p>
                          </>
                        )}
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                 <div className="col-span-1 md:col-span-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">
                   MUTATION WARNING: {errorMsg}
                 </div>
              )}

              <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => { setEditingProduct(null); setSelectedFile(null); }}
                  className="rounded-none h-12 px-6 text-xs uppercase tracking-widest font-bold border-foreground/20"
                >
                  Discard Changes
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className="flex-1 rounded-none h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-[0.4em] text-xs transition-all"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Committing State...
                    </span>
                  ) : (
                    "Re-Authorize Registry Entry"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}