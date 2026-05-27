"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingNav from "@/components/navigation/floating-nav";
import ShareButton from "@/components/ui/share-button";

export default function StockhousePage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (pData) setProducts(pData);
    };

    fetchData();

    const channel = supabase
      .channel("public-inventory-stream")
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

  const getStockColor = (status: string) => {
    if (status === 'Out of Stock') return "text-destructive";
    if (status === 'Low Stock') return "text-amber-500";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <FloatingNav />
      
      <main className="flex-1 md:pl-32 pt-8 md:pt-16 px-6 md:px-12 pb-32">
        
        {/* Header Block with Flex Align for the Global Share Action */}
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-[64px] font-black uppercase tracking-tighter leading-[0.85]">
              Dishpatch<br /><span className="text-primary italic font-serif tracking-normal">Stockhouse</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-muted-foreground pl-1 mt-4">
              Live Commissary Ledger
            </p>
          </div>
          
          {/* Global Share Component Trigger */}
          <div className="sm:pt-2">
            <ShareButton 
              title="Dishpatch Stockhouse Ledger" 
              text="View real-time catalog availability for the Dishpatch commissary ecosystem." 
            />
          </div>
        </header>

        {/* The Pure Ledger Table */}
        <div className="w-full overflow-x-auto pb-8 custom-scrollbar border-t border-foreground/10">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-foreground/20 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="py-4 px-2 w-16">Item</th>
                <th className="py-4 px-4">Designation</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-right">Quantity</th>
                <th className="py-4 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const imageUrl = resolveImageUrl(product.image_url);
                  return (
                    <motion.tr 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group border-b border-foreground/5 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="w-12 h-12 bg-muted relative overflow-hidden border border-foreground/10">
                          {imageUrl ? (
                            <Image 
                              src={imageUrl} 
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 font-serif italic text-[8px]">
                              N/A
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className="font-black uppercase tracking-tight text-sm">
                          {product.name}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <motion.span 
                          key={product.current_stock}
                          initial={{ scale: 1.5, color: "var(--primary)" }}
                          animate={{ scale: 1, color: "inherit" }}
                          className="font-mono font-bold text-sm"
                        >
                          {Math.max(0, product.current_stock || 0)}
                        </motion.span>
                      </td>

                      <td className={cn(
                        "py-3 px-4 text-right text-[9px] font-black uppercase tracking-widest",
                        getStockColor(product.stock_status)
                      )}>
                        {product.stock_status || "Unknown"}
                      </td>

                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
              <PackageOpen size={32} className="mb-4 opacity-50" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">No inventory records found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}