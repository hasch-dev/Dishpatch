"use client";
import { useState } from "react";
import { X, ShoppingBag, ChefHat, CheckCircle2 } from "lucide-react";

export function CulinaryCatalog({ isOpen, onClose, onConfirm, currentSelection }: any) {
  const [activeChef, setActiveChef] = useState<string | null>(null);
  const [tab, setTab] = useState<"menu" | "alacarte">("menu");
  const [cart, setCart] = useState<any[]>(currentSelection || []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-12">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-[1800px] bg-card border border-border flex shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Section 1: Chefs */}
        <aside className="w-80 border-r border-border p-8 flex flex-col gap-8 bg-muted/5">
          <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Artisan Selection</h3>
          <div className="space-y-4">
            {/* Example Chef - In production map your Supabase data here */}
            <button 
              onClick={() => setActiveChef("1")}
              className={`w-full p-6 text-left border transition-all ${activeChef === "1" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <ChefHat size={20} className="mb-4 opacity-50" />
              <p className="font-serif text-xl">Chef Jean-Pierre</p>
              <p className="text-[8px] uppercase tracking-widest opacity-40">Modern French / Fusion</p>
            </button>
          </div>
        </aside>

        {/* Section 2: Items */}
        <main className="flex-1 p-12 flex flex-col">
          <div className="flex gap-12 border-b border-border mb-12">
            {["menu", "alacarte"].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t as any)}
                className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${tab === t ? "text-primary border-b-2 border-primary" : "opacity-30"}`}
              >
                {t === "menu" ? "Stylized Menus" : "A La Carte Items"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 overflow-y-auto pr-4 custom-scrollbar">
            {/* Map items based on Chef + Tab */}
            <div className="p-8 border border-border hover:border-primary group cursor-pointer transition-all">
              <h4 className="text-xl font-serif mb-2">The Heritage Set</h4>
              <p className="text-xs text-muted-foreground mb-6">A 7-course journey through pre-colonial flavors.</p>
              <button className="text-[9px] uppercase tracking-widest font-bold text-primary">+ Add to Journey</button>
            </div>
          </div>
        </main>

        {/* Section 3: Cart */}
        <aside className="w-96 border-l border-border p-10 flex flex-col bg-muted/10">
          <div className="flex items-center gap-3 mb-10">
            <ShoppingBag size={18} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Your Selections</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <p className="text-[10px] uppercase text-center py-20 opacity-30">No items selected</p>
            ) : (
              cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-border/50">
                   <span className="text-sm font-serif">{item.name}</span>
                   <button onClick={() => {}} className="text-red-500 text-[8px] uppercase">Remove</button>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => onConfirm(cart)}
            className="w-full bg-primary text-primary-foreground py-6 text-[10px] uppercase tracking-[0.5em] font-bold"
          >
            Confirm Catalog Selection
          </button>
        </aside>
      </div>
    </div>
  );
}