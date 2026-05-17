"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, Send, ArrowRight, PackageOpen, X, Info, LayoutGrid, FileText
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
  
  const [inquiryText, setInquiryText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase.from("products").select("*").order("name");
      if (data) setProducts(data);
    };
    fetchData();
  }, [supabase]);

  // --- IMAGE BUCKET HELPER ---
  const resolveImageUrl = (path: string | null) => {
    if (!path) return null;
    // If it's already a full URL (legacy data), return it
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // Otherwise, fetch public URL from the 'products' bucket
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
    if (!user) return alert("System Auth Required: Please log in to transmit an inquiry.");
    if (!inquiryText.trim()) return;
    
    setIsSending(true);
    await supabase.from("product_inquiries").insert({
      user_id: user.id,
      product_id: selectedProduct.id,
      message: inquiryText,
    });
    setInquiryText("");
    setIsSending(false);
    alert("Transmission successful. The artisan team will review your request.");
  };

  // When opening a new product, reset the tab to overview
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setActiveTab("overview");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative">
      
      <FloatingNav />

      {/* MAIN COHESIVE LAYOUT */}
      <main className="flex-1 md:pl-28 pt-8 md:pt-16 px-6 md:px-12 pb-32">
        
        {/* Header & Global Search */}
        <header className="space-y-12 mb-16 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-[0.8]">
                The<br /><span className="text-primary italic font-serif">Registry</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-muted-foreground pl-2">
                System-Wide Asset Catalog
              </p>
            </div>
            
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
              <Input 
                placeholder="SEARCH CATALOG..."
                className="pl-12 h-16 rounded-none border-4 border-foreground bg-transparent text-xs font-black uppercase tracking-[0.2em] focus-visible:ring-0 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabbed Category Ribbon */}
          <nav className="sticky top-4 z-40 flex flex-wrap gap-2 bg-background/90 backdrop-blur-md p-2 border-2 border-foreground/10 rounded-sm">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
                  activeCategory === cat 
                    ? "border-foreground bg-foreground text-background" 
                    : "border-transparent hover:border-foreground/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </nav>
        </header>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="group cursor-pointer border-4 border-foreground/10 hover:border-foreground p-4 bg-card hover:bg-foreground hover:text-background transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square bg-muted mb-6 overflow-hidden relative border-2 border-transparent group-hover:border-background/20">
                  {product.image_url ? (
                    <img 
                      src={resolveImageUrl(product.image_url) as string} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 font-serif italic text-2xl">
                      No Media
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-background text-foreground group-hover:bg-primary group-hover:text-background px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors">
                    {product.stock_status || "Unknown"}
                  </div>
                </div>
                
                <div className="space-y-3 flex-1 flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">
                    {product.category || "Uncategorized"}
                  </span>
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-2xl font-black uppercase tracking-tighter leading-none line-clamp-2">
                      {product.name}
                    </h4>
                  </div>
                  <div className="mt-auto pt-4 flex justify-between items-end border-t-2 border-foreground/5 group-hover:border-background/20">
                    <span className="font-serif italic text-2xl opacity-90">
                      ${product.price?.toLocaleString()}
                    </span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-20 border-4 border-dashed border-foreground/10 max-w-7xl">
            <PackageOpen size={64} className="mb-6" strokeWidth={1} />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Inventory Empty</p>
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
            className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar flex flex-col md:flex-row"
          >
            {/* Visual Header / Left Side */}
            <div className="w-full md:w-5/12 h-[40vh] md:h-screen sticky top-0 bg-muted/20 border-b-8 md:border-b-0 md:border-r-8 border-foreground relative">
              {selectedProduct.image_url ? (
                <img 
                  src={resolveImageUrl(selectedProduct.image_url) as string} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover grayscale-[0.2]" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <PackageOpen size={120} strokeWidth={0.5} />
                </div>
              )}
              
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-8 left-8 bg-foreground text-background p-4 hover:bg-primary transition-colors group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Content / Right Side */}
            <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col min-h-screen">
              
              <header className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 bg-foreground text-background">
                    {selectedProduct.category}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.4em] border-2 px-4 py-1.5",
                    selectedProduct.stock_status?.toLowerCase().includes("in stock") 
                      ? "border-green-500/50 text-green-500" 
                      : "border-red-500/50 text-red-500"
                  )}>
                    {selectedProduct.stock_status}
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                  {selectedProduct.name}
                </h2>
              </header>

              {/* DOSSIER TABS NAVIGATION */}
              <div className="flex gap-2 border-b-2 border-foreground/10 mb-8">
                {[
                  { id: "overview", icon: Info, label: "Overview" },
                  { id: "specs", icon: LayoutGrid, label: "Specifications" },
                  { id: "inquiry", icon: FileText, label: "Acquisition" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <tab.icon size={14} /> {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {/* DOSSIER TAB CONTENT */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-3xl">
                      <p className="text-3xl font-serif italic leading-snug border-l-[6px] border-primary pl-8 text-foreground/90">
                        {selectedProduct.description}
                      </p>
                      <div className="bg-foreground text-background p-10 space-y-4 border-[4px] border-foreground inline-block min-w-[300px] mt-8">
                        <div className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-60">Estimated Value</div>
                        <div className="text-6xl font-serif italic">${selectedProduct.price?.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: SPECIFICATIONS */}
                  {activeTab === "specs" && (
                    <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
                      <div className="prose prose-lg dark:prose-invert font-light text-muted-foreground leading-loose whitespace-pre-line bg-muted/20 p-10 border-2 border-foreground/5">
                        {selectedProduct.long_description || "Detailed specifications pending artisan review."}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: INQUIRY */}
                  {activeTab === "inquiry" && (
                    <motion.div key="inquiry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
                      <div className="border-4 border-foreground p-10 space-y-8 bg-background">
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Send size={20} className="text-primary" /> Direct Transmission
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                            Send a request directly to the artisan team to discuss acquisition, custom modifications, or lead times for this asset.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <Textarea 
                            placeholder="Enter your inquiry details..."
                            className="min-h-[160px] rounded-none border-2 border-foreground/10 bg-muted/10 text-sm focus-visible:ring-primary focus-visible:border-primary resize-none p-4"
                            value={inquiryText}
                            onChange={(e) => setInquiryText(e.target.value)}
                          />
                          <Button 
                            onClick={handleInquiry}
                            disabled={isSending || !inquiryText.trim()}
                            className="w-full rounded-none h-16 bg-foreground text-background uppercase text-[11px] font-black tracking-[0.4em] hover:bg-primary transition-all group flex items-center justify-between px-8"
                          >
                            {isSending ? "Transmitting..." : "Submit Inquiry"}
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
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