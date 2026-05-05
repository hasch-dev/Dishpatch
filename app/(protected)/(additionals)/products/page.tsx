"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";
import { Search, Send, ArrowRight, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [inquiryText, setInquiryText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase.from("products").select("*").order("name");
      if (data) {
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0]);
      }
    };
    fetchData();
  }, [supabase]);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInquiry = async () => {
    if (!user) return alert("Please log in to send an inquiry.");
    if (!inquiryText.trim()) return;
    
    setIsSending(true);
    await supabase.from("product_inquiries").insert({
      user_id: user.id,
      product_id: selectedProduct.id,
      message: inquiryText,
    });
    setInquiryText("");
    setIsSending(false);
    alert("Inquiry sent successfully. An artisan representative will contact you via your dashboard.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* LEFT: Searchable List */}
        <section className="lg:col-span-3 border-r border-border bg-sidebar flex flex-col h-full">
          <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm z-10 sticky top-0">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">Inventory Search</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog..." 
                className="pl-9 rounded-none border-border bg-background text-xs uppercase tracking-widest focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={cn(
                  "w-full text-left p-4 mb-2 transition-all border-l-2 flex flex-col gap-1",
                  selectedProduct?.id === product.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent hover:bg-muted/50"
                )}
              >
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground italic font-serif">
                  {product.category || "Uncategorized"}
                </span>
                <span className={cn(
                  "font-bold uppercase tracking-tighter text-sm truncate",
                  selectedProduct?.id === product.id ? "text-primary" : "text-foreground"
                )}>
                  {product.name}
                </span>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <PackageOpen className="h-8 w-8 mb-4 opacity-50" />
                <p className="text-xs uppercase tracking-widest">No items found.</p>
              </div>
            )}
          </div>
        </section>

        {/* CENTER: Image & Details */}
        <section className="lg:col-span-6 border-r border-border bg-background flex flex-col h-full relative">
          <AnimatePresence mode="wait">
            {selectedProduct && (
              <motion.div 
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                {/* Image */}
                <div className="flex-1 relative bg-black overflow-hidden border-b border-border">
                  {selectedProduct.image_url ? (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif italic">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                </div>

                {/* Details Meta */}
                <div className="p-8 bg-background shrink-0">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em]">
                        {selectedProduct.category}
                      </span>
                      <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mt-2">
                        {selectedProduct.name}
                      </h1>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</span>
                      <span className={cn(
                        "font-mono text-sm font-bold", 
                        selectedProduct.stock_status?.toLowerCase().includes("in stock") ? "text-green-500" : "text-red-500"
                      )}>
                        {selectedProduct.stock_status || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground font-light text-sm max-w-xl">
                    {selectedProduct.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT: Detailed Description & Inquiry */}
        <section className="lg:col-span-3 bg-sidebar flex flex-col h-full overflow-y-auto custom-scrollbar">
          {selectedProduct ? (
            <div className="p-8 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-border pb-4 mb-6 text-foreground">
                  Specifications
                </h3>
                <div className="prose prose-sm dark:prose-invert font-light text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedProduct.long_description || "Detailed specifications are currently being compiled by the artisan team."}
                </div>
                
                {selectedProduct.price && (
                  <div className="mt-8 p-4 bg-background border border-border flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold">Estimated Value</span>
                    <span className="font-mono text-primary font-bold">${selectedProduct.price}</span>
                  </div>
                )}
              </div>

              {/* Inquiry Form */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-primary flex items-center gap-2">
                  <Send className="h-3 w-3" /> Request Information
                </h3>
                <Textarea 
                  placeholder="Ask about availability, sourcing, or custom orders..."
                  className="min-h-[120px] rounded-none border-border bg-background resize-none text-sm focus-visible:ring-primary mb-4"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                />
                <Button 
                  onClick={handleInquiry}
                  disabled={isSending || !inquiryText.trim()}
                  className="w-full rounded-none uppercase tracking-[0.2em] font-bold text-[10px] group flex items-center justify-between"
                >
                  {isSending ? "Transmitting..." : "Submit Inquiry"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
              <p className="text-[10px] uppercase tracking-widest font-bold">Select an item from the inventory to view details.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}