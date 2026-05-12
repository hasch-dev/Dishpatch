"use client";

import { useState } from "react";
import { Check, Search, X, AlertTriangle } from "lucide-react";
import { INGREDIENTS_REGISTRY } from "@/constants/ingredients";
import { cn } from "@/lib/utils";

export default function IngredientSelector({ selected, onChange }: any) {
  const [query, setQuery] = useState("");
  const filtered = INGREDIENTS_REGISTRY.filter(i => 
    i.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleIngredient = (name: string) => {
    selected.includes(name) 
      ? onChange(selected.filter((i: string) => i !== name))
      : onChange([...selected, name]);
  };

  return (
    <div className="space-y-4">
      <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Composition & Safety</label>
      
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30 group-focus-within:text-primary transition-colors" />
        <input 
          className="w-full bg-muted/20 border border-border/40 h-10 pl-9 text-xs focus:outline-none focus:border-primary/50 transition-all italic"
          placeholder="Filter by ingredient name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selected.map((item: string) => (
          <button 
            key={item} 
            onClick={() => toggleIngredient(item)}
            className="bg-primary text-primary-foreground text-[9px] px-2 py-1 flex items-center gap-2 font-bold tracking-widest hover:bg-destructive transition-colors group"
          >
            {item.toUpperCase()} <X size={10} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/20 border border-border/20 max-h-48 overflow-y-auto custom-scrollbar">
        {filtered.map(ing => (
          <div 
            key={ing.id}
            onClick={() => toggleIngredient(ing.name)}
            className={cn(
              "p-3 text-[11px] flex items-center justify-between cursor-pointer transition-colors bg-background hover:bg-muted/50",
              selected.includes(ing.name) && "bg-primary/5"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium tracking-tight">{ing.name}</span>
              <span className="text-[8px] uppercase opacity-40">{ing.category}</span>
            </div>
            <div className="flex items-center gap-3">
              {ing.isAllergen && (
                <div className="group/warn relative">
                  <AlertTriangle size={12} className="text-orange-500/60" />
                  <span className="absolute bottom-full right-0 mb-2 hidden group-hover/warn:block bg-destructive text-white text-[8px] px-2 py-1 whitespace-nowrap">
                    Contains {ing.allergenType}
                  </span>
                </div>
              )}
              <div className={cn(
                "h-4 w-4 border flex items-center justify-center transition-colors",
                selected.includes(ing.name) ? "bg-primary border-primary" : "border-border/60"
              )}>
                {selected.includes(ing.name) && <Check size={10} className="text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}