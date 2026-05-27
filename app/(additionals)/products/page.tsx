"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, PackageOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import FloatingNav from "@/components/navigation/floating-nav";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

// Import our new modular components
import ProductImageGallery from "@/components/products/product-image-gallery";
import ProductInfoHeader from "@/components/products/product-info-header";
import ProductTabs from "@/components/products/products-tabs";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .eq("is_hidden", false)
        .order("name");

      if (pData) {
        setProducts(pData);
        setSelectedProduct((current: any) => {
          if (!current) return null;
          return pData.find(m => m.id === current.id) || current;
        });
      }
    };

    fetchData();

    const channel = supabase
      .channel("live-inventory-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_transactions" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const resolveImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeCategory !== "ALL") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    return filtered;
  }, [products, searchQuery, activeCategory]);

  const categories = useMemo(() => {
    return ["ALL", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  }, [products]);

  const getStockColor = (status: string) => {
    if (status === 'Out of Stock') return "bg-destructive/10 text-destructive border-destructive/20";
    if (status === 'Low Stock') return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-background/90 text-foreground border-foreground/10";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-primary-foreground">
      <FloatingNav />

      <main className="flex-1 md:pl-32 pt-8 md:pt-16 px-6 md:px-12 pb-32">
        <header className="space-y-12 mb-16 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-[80px] font-black uppercase tracking-tighter leading-[0.85]">
                Commissary<br /><span className="text-primary italic font-serif tracking-normal">Catalog</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-muted-foreground pl-1 mt-4">
                System-Wide Dishpatch Assets
              </p>
            </div>
            
            <div className="w-full md:w-[400px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="SEARCH CATALOG..."
                className="pl-12 h-14 rounded-none border-x-0 border-t-0 border-b-2 border-foreground/20 bg-transparent text-xs font-black uppercase tracking-[0.2em] focus-visible:ring-0 focus-visible:border-foreground transition-all px-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="sticky top-4 z-40 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-full border border-foreground/10",
                  activeCategory === cat 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50"
                )}
              >
                {cat}
              </button>
            ))}
          </nav>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 max-w-7xl">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                resolveImageUrl={resolveImageUrl}
                getStockColor={getStockColor}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 max-w-7xl">
            <PackageOpen size={48} className="mb-6 opacity-50" strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No matching assets found</p>
          </div>
        )}
      </main>

      {/* FULL-SCREEN TABBED DOSSIER OVERLAY */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-3xl overflow-y-auto custom-scrollbar flex flex-col md:flex-row"
          >
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="fixed top-6 right-6 md:top-8 md:right-8 z-[210] bg-background/50 backdrop-blur-md border border-foreground/10 text-foreground p-3 rounded-full hover:bg-foreground hover:text-background transition-all group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Left Side: Modular Gallery Component */}
            <ProductImageGallery 
              imageUrl={resolveImageUrl(selectedProduct.image_url)} 
              name={selectedProduct.name} 
            />

            {/* Right Side: Modular Info & Tabs */}
            <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col min-h-screen">
              
              <ProductInfoHeader 
                name={selectedProduct.name}
                category={selectedProduct.category}
                stockStatus={selectedProduct.stock_status}
                stockColorClass={getStockColor(selectedProduct.stock_status)}
                currentStock={selectedProduct.current_stock}
              />

              <ProductTabs 
                description={selectedProduct.description}
                longDescription={selectedProduct.long_description}
                specifications={selectedProduct.specifications}
                price={selectedProduct.price}
                href={selectedProduct.href}
              />
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}