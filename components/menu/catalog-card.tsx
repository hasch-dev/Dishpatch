"use client";

import { useMemo } from "react";
import { Edit2, Trash2, UtensilsCrossed, PhilippinePeso, Layers, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FOOD_CATEGORIES } from "@/constants/food-categories"; 
import { CULINARY_STYLES } from "@/constants/culinary-styles";

interface CatalogCardProps {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CatalogCard({ item, onEdit, onDelete }: CatalogCardProps) {
  const isMenu = item.item_type === "grouped_menu";

  // 1. Derive readable labels for the badges
  const styleLabel = useMemo(() => {
    return CULINARY_STYLES.find(s => s.value === item.culinary_style)?.label || item.culinary_style;
  }, [item.culinary_style]);

  const categoryLabel = useMemo(() => {
    if (isMenu) return "Menu Assembly";
    const category = FOOD_CATEGORIES.find(c => c.value === item.food_category);
    return category ? category.label : "Uncategorized";
  }, [item.food_category, isMenu]);

  // 2. Pricing Logic
  const displayPrice = useMemo(() => {
    if (item.price) return { label: "Fixed Rate", amount: item.price };
    if (item.catalog_item_pricing?.length > 0) {
      const minPrice = Math.min(...item.catalog_item_pricing.map((p: any) => p.price));
      return { label: "Starts at", amount: minPrice };
    }
    return { label: "Unpriced", amount: 0 };
  }, [item]);

  return (
    <div className="group relative flex flex-col sm:flex-row bg-background border border-border/40 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden h-[320px]">
      
      {/* LEFT: Image Container */}
      <div className="relative sm:w-2/5 h-48 sm:h-full shrink-0 bg-muted/20 overflow-hidden border-b sm:border-b-0 sm:border-r border-border/40">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
            {isMenu ? <Layers size={48} strokeWidth={1} /> : <UtensilsCrossed size={48} strokeWidth={1} />}
            <span className="text-[9px] uppercase tracking-widest mt-4 font-black">No Image</span>
          </div>
        )}
        
        <div className={cn(
          "absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 border shadow-sm",
          isMenu ? "border-primary/40 text-primary" : "border-border/20 text-foreground"
        )}>
          <span className="text-[8px] uppercase tracking-[0.2em] font-black">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* RIGHT: Content Container */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br from-background to-muted/5">
        
        {/* Actions - StopPropagation prevents opening the detail popup when clicking buttons */}
        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="h-8 w-8 hover:bg-primary hover:text-primary-foreground border border-transparent hover:border-primary"
          >
            <Edit2 size={12} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground border border-transparent hover:border-destructive"
          >
            <Trash2 size={12} />
          </Button>
        </div>

        {/* Header Section */}
        <div className="space-y-4 pr-12">
          <div>
            <h3 className="font-serif italic text-2xl sm:text-3xl leading-tight line-clamp-2">
              {item.name}
            </h3>
            {isMenu && (
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-4 bg-primary" />
                <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">
                  {item.linked_item_ids?.length || 0} Courses Orchestrated
                </p>
              </div>
            )}
          </div>
          
          <p className="text-sm italic opacity-60 line-clamp-3 leading-relaxed">
            {item.description || item.story || "No narrative archived for this entry."}
          </p>
        </div>

        {/* FOOTER: This is where the logic changes based on item_type */}
        <div className="mt-6 pt-4 border-t border-border/20 flex items-end justify-between">
          <div className="flex-1 max-w-[60%]">
            
            {isMenu ? (
              /* MENU-SPECIFIC DETAILS: Style & Classification */
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 px-2.5 py-1">
                  <Globe size={10} className="text-primary" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-primary">
                    {styleLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/40 border border-border/40 px-2.5 py-1">
                  <ShieldCheck size={10} className="opacity-40" />
                  <span className="text-[9px] uppercase font-black tracking-widest opacity-60">
                    {item.classification?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ) : (
              /* A LA CARTE DETAILS: Ingredients */
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients?.slice(0, 3).map((ing: any, i: number) => (
                  <span key={i} className="text-[9px] uppercase font-mono tracking-widest bg-muted/30 px-2 py-1 border border-border/20">
                    {ing}
                  </span>
                ))}
                {(item.ingredients?.length > 3) && (
                  <span className="text-[9px] uppercase font-mono tracking-widest px-1 opacity-40">
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
              <PhilippinePeso size={14} strokeWidth={3} />
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