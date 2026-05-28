"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowUpDown, Plus, Minus, Loader2, Search, Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AdjustmentFormProps {
  products: any[];
  isSubmitting: boolean;
  onSubmitTransaction: (data: { productId: string; quantity: number; type: "IN" | "OUT"; notes: string }) => Promise<boolean>;
}

export default function AdjustmentForm({ products, isSubmitting, onSubmitTransaction }: AdjustmentFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Searchable Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find currently selected product details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Scalable high-performance filtering for the asset search box
  const filteredAssets = useMemo(() => {
    if (!assetSearchQuery.trim()) return products;
    const query = assetSearchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
    );
  }, [products, assetSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || !transactionType) return;

    const success = await onSubmitTransaction({
      productId: selectedProductId,
      quantity: parseInt(quantity, 10),
      type: transactionType,
      notes,
    });

    if (success) {
      setQuantity("");
      setNotes("");
      setSelectedProductId("");
    }
  };

  return (
    <Card className="rounded-xl border border-border/40 shadow-xl shadow-black/5 bg-card/40 backdrop-blur-md w-full">
      <CardHeader className="border-b border-border/30 p-6 bg-muted/10">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
          <div className="h-8 w-8 rounded-lg bg-background border border-border/50 flex items-center justify-center">
            <ArrowUpDown className="h-4 w-4 text-primary" strokeWidth={1.5} /> 
          </div>
          Post Ledger Entry
        </CardTitle>
        <CardDescription className="text-xs font-normal text-muted-foreground mt-1">
          Commit real-time asset changes straight to data cache tables.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column Controls */}
            <div className="space-y-4">
              
              {/* Scalable Custom Search Combobox */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                  Target Registry Asset
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full rounded-lg border border-border/50 h-11 bg-background/50 text-sm px-4 flex items-center justify-between text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {selectedProduct ? (
                    <span className="truncate text-foreground font-medium">
                      {selectedProduct.name}
                      <span className="text-muted-foreground/60 text-xs font-normal ml-1.5">
                        (Stock: {selectedProduct.current_stock ?? 0})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">Search or select registry item...</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground/70 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Drop-down Search Box Layout Layer */}
                {isDropdownOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-popover border border-border/40 shadow-2xl rounded-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-border/30 bg-muted/20 flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground/50 ml-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Type to filter by name or segment..."
                        value={assetSearchQuery}
                        onChange={(e) => setAssetSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-0 h-8 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 text-foreground"
                        autoFocus
                      />
                    </div>
                    
                    <ul className="max-h-[220px] overflow-y-auto p-1 divide-y divide-border/5">
                      {filteredAssets.length === 0 ? (
                        <li className="text-xs text-muted-foreground/70 text-center py-6 font-medium">
                          No matching inventory items found
                        </li>
                      ) : (
                        filteredAssets.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setIsDropdownOpen(false);
                                setAssetSearchQuery("");
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center justify-between transition-colors ${
                                selectedProductId === p.id 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <div className="truncate pr-4">
                                <span className="block truncate font-medium">{p.name}</span>
                                <span className="block text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold mt-0.5">
                                  {p.category || "General"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs tabular-nums text-muted-foreground/80 font-semibold bg-muted/50 px-2 py-0.5 rounded border border-border/10">
                                  Vol: {p.current_stock ?? 0}
                                </span>
                                {selectedProductId === p.id && <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />}
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">Directional Sign</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => setTransactionType("IN")}
                    className={`rounded-lg h-11 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      transactionType === "IN" 
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/10" 
                        : "bg-background/50 hover:bg-muted text-muted-foreground border border-border/50"
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} /> Stock In (+)
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setTransactionType("OUT")}
                    className={`rounded-lg h-11 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      transactionType === "OUT" 
                        ? "bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/10" 
                        : "bg-background/50 hover:bg-muted text-muted-foreground border border-border/50"
                    }`}
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} /> Stock Out (-)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">Operation Volume</label>
                <Input 
                  type="number"
                  min="1"
                  placeholder="Enter item quantity payload"
                  className="rounded-lg h-11 border-border/50 text-sm bg-background/50 focus-visible:ring-primary/20"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Right Column Controls */}
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-2 h-full flex flex-col">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">Audit Context Note</label>
                <Textarea 
                  placeholder="Provide historical context description..."
                  className="rounded-lg border-border/50 text-sm bg-background/50 focus-visible:ring-primary/20 resize-none p-4 flex-grow min-h-[140px] md:min-h-0"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-border/30 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedProductId || !quantity}
              className="w-full md:w-auto md:px-8 rounded-lg h-11 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Committing Transaction Pipeline...
                </>
              ) : (
                "Commit Transaction Entry"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}