"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, LayoutGrid, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductTabsProps {
  description: string | null;
  longDescription: string | null;
  specifications: any; // JSONB
  price: number;
  href: string | null;
}

export default function ProductTabs({ description, longDescription, specifications, price, href }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "acquisition">("overview");

  // Parse JSONB array for ingredients safely
  const ingredients: string[] = useMemo(() => {
    if (!specifications) return [];
    if (Array.isArray(specifications)) return specifications;
    if (specifications.ingredients && Array.isArray(specifications.ingredients)) {
      return specifications.ingredients;
    }
    return [];
  }, [specifications]);

  const tabs = [
    { id: "overview", icon: Info, label: "Overview" },
    { id: "specs", icon: LayoutGrid, label: "Specifications" },
    { id: "acquisition", icon: ShoppingBag, label: "Acquisition" }
  ] as const;

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Ribbon */}
      <div className="flex gap-6 border-b border-foreground/10 mb-10 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Contents */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-2xl">
              <p className="text-2xl md:text-3xl font-serif italic leading-relaxed text-muted-foreground">
                {description || "No general overview provided for this asset."}
              </p>
              {longDescription && (
                <div className="prose prose-sm dark:prose-invert font-light text-muted-foreground leading-loose whitespace-pre-line mt-6">
                  {longDescription}
                </div>
              )}
            </motion.div>
          )}

          {/* SPECIFICATIONS (INGREDIENTS) TAB */}
          {activeTab === "specs" && (
            <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-foreground/50">Ingredient Composition</h4>
              {ingredients.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ingredients.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium border-b border-foreground/5 pb-2">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-serif italic text-muted-foreground">No structural specifications available for this batch.</p>
              )}
            </motion.div>
          )}

          {/* ACQUISITION TAB */}
          {activeTab === "acquisition" && (
            <motion.div key="acquisition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-xl">
              <div className="bg-foreground/[0.02] border border-foreground/10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                
                {/* Value Block */}
                <div>
                  <div className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-40 mb-2">Direct Valuation</div>
                  <div className="text-5xl font-serif italic">
                    ₱{Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Marketplace Action */}
                <div className="w-full md:w-auto">
                  {href && href !== "/" ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button className="w-full h-14 px-8 bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white rounded-none uppercase text-[10px] font-black tracking-[0.3em] transition-all group flex items-center justify-center gap-4 border-none shadow-none">
                        Shopee Portal
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </a>
                  ) : (
                    <Button disabled variant="outline" className="w-full h-14 px-8 rounded-none uppercase text-[10px] font-black tracking-[0.3em] border-foreground/10 bg-transparent text-muted-foreground">
                      Portal Offline
                    </Button>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}