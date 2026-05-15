"use client";

import { useMemo } from "react";
import { Edit2, Trash2, UtensilsCrossed, PhilippinePeso, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FOOD_CATEGORIES } from "@/constants/food-categories"; // Import this to get the labels

interface CatalogCardProps {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CatalogCard({ item, onEdit, onDelete }: CatalogCardProps) {
  // Derive the display price based on the pricing strategy used
  const displayPrice = useMemo(() => {
    if (item.price) {
      return { label: "Fixed", amount: item.price };
    }
    if (item.catalog_item_pricing && item.catalog_item_pricing.length > 0) {
      const minPrice = Math.min(...item.catalog_item_pricing.map((p: any) => p.price));
      return { label: "Starts at", amount: minPrice };
    }
    return { label: "Unpriced", amount: 0 };
  }, [item]);

  // Helper to get the readable category label (e.g., "Meat & Poultry" instead of "meat")
  const categoryLabel = useMemo(() => {
    const category = FOOD_CATEGORIES.find(c => c.value === item.food_category);
    return category ? category.label : (item.section_type || "Uncategorized");
  }, [item.food_category, item.section_type]);

  const isMenu = item.item_type === "grouped_menu";

  return (
    <div className="group relative flex flex-col sm:flex-row bg-background border border-border/40 hover:border-primary/50 transition-colors shadow-sm hover:shadow-xl overflow-hidden h-[320px]">
      
      {/* LEFT: Image Container */}
      <div className="relative sm:w-2/5 h-48 sm:h-full shrink-0 bg-muted/20 overflow-hidden border-b sm:border-b-0 sm:border-r border-border/40">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
            {isMenu ? <Layers size={48} strokeWidth={1} /> : <UtensilsCrossed size={48} strokeWidth={1} />}
            <span className="text-[9px] uppercase tracking-widest mt-4 font-black">No Image</span>
          </div>
        )}
        
        {/* Classification Badge overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 border border-border/20">
          <span className="text-[8px] uppercase tracking-[0.2em] font-black">
            {/* UPDATED: Uses the derived categoryLabel instead of section_type */}
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* RIGHT: Content Container */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br from-background to-muted/5">
        
        {/* Actions (Top Right) */}
        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 hover:bg-primary hover:text-primary-foreground">
            <Edit2 size={12} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 size={12} />
          </Button>
        </div>

        {/* Header & Description */}
        <div className="space-y-4 pr-12">
          <div>
            <h3 className="font-serif italic text-2xl sm:text-3xl leading-tight line-clamp-2">
              {item.name}
            </h3>
            {isMenu && item.linked_item_ids && (
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 mt-2 font-bold">
                {item.linked_item_ids.length} Courses Comprised
              </p>
            )}
          </div>
          
          <p className="text-sm italic opacity-60 line-clamp-3 leading-relaxed">
            {item.description || item.story || "No narrative provided for this item."}
          </p>
        </div>

        {/* Footer: Ingredients & Pricing */}
        <div className="mt-6 pt-4 border-t border-border/20 flex items-end justify-between">
          <div className="flex-1 max-w-[60%]">
            {!isMenu && item.ingredients && item.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.slice(0, 3).map((ing: any, i: number) => (
                  <span key={i} className="text-[9px] uppercase font-mono tracking-widest bg-muted/30 px-2 py-1 border border-border/20">
                    {ing.name}
                  </span>
                ))}
                {item.ingredients.length > 3 && (
                  <span className="text-[9px] uppercase font-mono tracking-widest px-1 opacity-50">
                    +{item.ingredients.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-40 mb-1">
              {displayPrice.label}
            </p>
            <div className="flex items-center justify-end gap-1 text-primary">
              <PhilippinePeso size={14} />
              <span className="font-mono text-xl font-bold">
                {displayPrice.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}