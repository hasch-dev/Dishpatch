"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, Send, ArrowRight, PackageOpen, X, Info, LayoutGrid, FileText, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import FloatingNav from "@/components/navigation/floating-nav";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Tab state for the Dossier
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "inquiry">("overview");
  
  // Inquiry Form States
  const [inquiryText, setInquiryText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "success" | "error" | "unauthorized">("idle");
  
  const [user, setUser] = useState<any>(null);

  // --- LIVE INVENTORY & DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 1. Fetch public products (ignoring hidden ones)
      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .eq("is_hidden", false)
        .order("name");

      // 2. Fetch the live stock calculations from our view
      const { data: sData } = await supabase
        .from("product_stock_view")
        .select("id, current_stock");

      if (pData) {
        // Merge the live stock number into the product object
        const merged = pData.map(p => ({
          ...p,
          current_stock: sData?.find((s: any) => s.id === p.id)?.current_stock || 0
        }));
        setProducts(merged);

        // If a product is currently open in the dossier, update it too
        setSelectedProduct((current: any) => {
          if (!current) return null;
          return merged.find(m => m.id === current.id) || current;
        });
      }
    };

    fetchData();

    // 3. The Silent Refresher: Listen for admin inventory updates in the background
    const channel = supabase
      .channel("live-inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_transactions" },
        () => {
          fetchData(); // Silently re-fetch and trigger Framer Motion animations
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // --- IMAGE BUCKET HELPER ---
  const resolveImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  // --- FILTERING LOGIC ---
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

  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // --- INQUIRY HANDLER ---
  const handleInquiry = async () => {
    if (!user) {
      setInquiryStatus("unauthorized");
      return;
    }
    if (!inquiryText.trim()) return;
    
    setIsSending(true);
    setInquiryStatus("idle");

    const { error } = await supabase.from("product_inquiries").insert({
      user_id: user.id,
      product_id: selectedProduct.id,
      message: inquiryText,
    });

    setIsSending(false);

    if (error) {
      setInquiryStatus("error");
    } else {
      setInquiryStatus("success");
      setInquiryText("");
      setTimeout(() => setInquiryStatus("idle"), 4000);
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setActiveTab("overview");
    setInquiryStatus("idle");
    setInquiryText("");
  };

  // Helper for dynamic stock colors
  const getStockColor = (status: string) => {
    if (status === 'Out of Stock') return "bg-destructive/10 text-destructive border-destructive/20";
    if (status === 'Low Stock') return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-background/90 text-foreground border-foreground/10";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-primary-foreground">
      
      <FloatingNav />

      {/* MAIN COHESIVE LAYOUT */}
      <main className="flex-1 md:pl-32 pt-8 md:pt-16 px-6 md:px-12 pb-32">
        
        {/* Header & Global Search */}
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

          {/* Tabbed Category Ribbon */}
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

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 max-w-7xl">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden relative border border-foreground/5 group-hover:border-foreground/20 transition-colors">
                  {product.image_url ? (
                    <>
                      <img 
                        src={resolveImageUrl(product.image_url) as string} 
                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        alt={product.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 font-serif italic text-2xl">
                      No Media
                    </div>
                  )}
                  {/* Dynamic Status Badge */}
                  <div className={cn(
                    "absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm border",
                    getStockColor(product.stock_status)
                  )}>
                    {product.stock_status || "Unknown"}
                  </div>
                </div>
                
                <div className="space-y-2 flex-1 flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
                    {product.category || "Uncategorized"}
                  </span>
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">
                      {product.name}
                    </h4>
                  </div>
                  
                  {/* Price and Animated Stock Count */}
                  <div className="mt-auto pt-4 flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="font-serif italic text-xl text-muted-foreground group-hover:text-foreground transition-colors">
                        ${product.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
                        <motion.span 
                          key={product.current_stock}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-xs font-bold"
                        >
                          {Math.max(0, product.current_stock)}
                        </motion.span>
                        <span className="text-[8px] uppercase tracking-widest">Units Available</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
                </div>
              </motion.div>
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

            {/* Visual Header / Left Side */}
            <div className="w-full md:w-5/12 h-[40vh] md:h-screen sticky top-0 bg-zinc-100 dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-foreground/10 relative">
              {selectedProduct.image_url ? (
                <img 
                  src={resolveImageUrl(selectedProduct.image_url) as string} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <PackageOpen size={120} strokeWidth={0.5} />
                </div>
              )}
            </div>

            {/* Content / Right Side */}
            <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col min-h-screen">
              
              <header className="space-y-6 mb-12">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 bg-foreground text-background">
                    {selectedProduct.category}
                  </span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.3em] border px-3 py-1.5 flex items-center gap-2",
                    getStockColor(selectedProduct.stock_status)
                  )}>
                    {selectedProduct.stock_status}
                  </span>
                  
                  {/* Live Dossier Stock Count */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-foreground/10 text-[9px] font-black uppercase tracking-[0.3em]">
                    <span className="text-muted-foreground">Vol:</span>
                    <motion.span 
                      key={selectedProduct.current_stock}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-primary"
                    >
                      {Math.max(0, selectedProduct.current_stock)}
                    </motion.span>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                  {selectedProduct.name}
                </h2>
              </header>

              {/* DOSSIER TABS NAVIGATION */}
              <div className="flex gap-6 border-b border-foreground/10 mb-10 overflow-x-auto pb-px">
                {[
                  { id: "overview", icon: Info, label: "Overview" },
                  { id: "specs", icon: LayoutGrid, label: "Specifications" },
                  { id: "inquiry", icon: FileText, label: "Acquisition" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                      activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                    )}
                  >
                    <tab.icon size={14} className={activeTab === tab.id ? "text-primary" : ""} /> 
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {/* DOSSIER TAB CONTENT */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-2xl">
                      <p className="text-2xl md:text-3xl font-serif italic leading-relaxed text-muted-foreground">
                        {selectedProduct.description || "No general overview provided for this asset."}
                      </p>
                      <div className="bg-foreground/[0.02] border border-foreground/10 p-8 inline-block min-w-[250px]">
                        <div className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-40 mb-2">Estimated Value</div>
                        <div className="text-5xl font-serif italic">${selectedProduct.price?.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: SPECIFICATIONS */}
                  {activeTab === "specs" && (
                    <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                      <div className="prose prose-sm dark:prose-invert font-light text-muted-foreground leading-loose whitespace-pre-line">
                        {selectedProduct.long_description || "Detailed specifications are currently pending artisan review."}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: INQUIRY */}
                  {activeTab === "inquiry" && (
                    <motion.div key="inquiry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-xl">
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 mb-2">
                            <Send size={16} className="text-primary" /> Direct Transmission
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Send a request directly to the artisan team to discuss acquisition, custom modifications, or lead times for this asset.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <Textarea 
                            placeholder="Enter your inquiry details..."
                            className="min-h-[160px] rounded-none border border-foreground/20 bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary resize-none p-4"
                            value={inquiryText}
                            onChange={(e) => setInquiryText(e.target.value)}
                            disabled={isSending || inquiryStatus === "success"}
                          />

                          {inquiryStatus === "unauthorized" && (
                            <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wider p-3 bg-destructive/10 border border-destructive/20">
                              <AlertCircle size={14} /> System Auth Required: Please log in first.
                            </div>
                          )}
                          {inquiryStatus === "error" && (
                            <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wider p-3 bg-destructive/10 border border-destructive/20">
                              <AlertCircle size={14} /> Transmission failed. Try again.
                            </div>
                          )}
                          {inquiryStatus === "success" && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider p-3 bg-green-500/10 border border-green-500/20">
                              <CheckCircle2 size={14} /> Transmission successful.
                            </div>
                          )}

                          <Button 
                            onClick={handleInquiry}
                            disabled={isSending || !inquiryText.trim() || inquiryStatus === "success"}
                            className="w-full rounded-none h-14 bg-foreground text-background uppercase text-[10px] font-black tracking-[0.3em] hover:bg-primary transition-all group flex items-center justify-center gap-4"
                          >
                            {isSending ? "Transmitting..." : inquiryStatus === "success" ? "Sent" : "Submit Inquiry"}
                            {!isSending && inquiryStatus !== "success" && (
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}