"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { PackageOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingNav from "@/components/navigation/floating-nav";
import { ProductCard } from "@/components/products/product-card";
import { cn } from "@/lib/utils";

// Component Imports
import ProductControls from "@/components/products/product-controls";
import ProductImageGallery from "@/components/products/product-image-gallery";
import ProductInfoHeader from "@/components/products/product-info-header";
import ProductTabs from "@/components/products/product-tabs";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Control Bar States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSort, setActiveSort] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
          return pData.find((m: any) => m.id === current.id) || current;
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

  const categories = useMemo(() => {
    return ["ALL", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  }, [products]);

  // Combined Filter & Sort Engine (Bulletproofed against null database entries)
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeCategory !== "ALL") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    return [...filtered].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      const nameA = String(a.name || "");
      const nameB = String(b.name || "");

      switch (activeSort) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "name-asc":
        default:
          return nameA.localeCompare(nameB);
      }
    });
  }, [products, searchQuery, activeCategory, activeSort]);

  const getStockColor = (status: string) => {
    if (status === 'Out of Stock') return "bg-destructive/10 text-destructive border-destructive/20";
    if (status === 'Low Stock') return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-background/90 text-foreground border-foreground/10";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-primary-foreground">
      <FloatingNav />

      <main className="flex-1 md:pl-32 pt-8 md:pt-16 px-6 md:px-12 pb-32">
        <header className="mb-8 max-w-7xl">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-[64px] font-black uppercase tracking-tighter leading-[0.85]">
              Commissary<br /><span className="text-primary italic font-serif tracking-normal">Catalog</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-muted-foreground pl-1 mt-4">
              System-Wide Dishpatch Assets
            </p>
          </div>
        </header>

        {/* Modular Controls Component */}
        <div className="max-w-7xl">
          <ProductControls 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Product Grid / List Layout Switcher */}
        <div className={cn(
          "max-w-7xl transition-all duration-300",
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16" 
            : "flex flex-col gap-y-6"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                resolveImageUrl={resolveImageUrl}
                getStockColor={getStockColor}
                viewMode={viewMode}
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

            <ProductImageGallery 
              imageUrl={resolveImageUrl(selectedProduct.image_url)} 
              name={selectedProduct.name} 
            />

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