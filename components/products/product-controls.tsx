"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProductControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  categories: string[];
  activeSort: string;
  setActiveSort: (val: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
}

export default function ProductControls({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  activeSort,
  setActiveSort,
  viewMode,
  setViewMode,
}: ProductControlsProps) {
  return (
    <div className="space-y-6 mb-12 sticky top-4 z-40 bg-background/95 backdrop-blur-md py-4 border-b border-foreground/10">
      
      {/* TOP ROW: Search & Utilities (Sort + View) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        
        {/* Search Bar */}
        <div className="relative group w-full md:w-[300px]">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
                type="text"
                placeholder="SEARCH LEDGER..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 h-10 bg-transparent border-b border-foreground/20 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-foreground transition-all rounded-none"
            />
        </div>

        {/* Utilities: Sort & View Toggle */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          
          {/* Native Brutalist Sort Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="appearance-none w-full md:w-auto bg-transparent border border-foreground/20 text-[10px] font-black uppercase tracking-widest px-4 py-3 pr-8 rounded-none focus:outline-none focus:border-foreground cursor-pointer text-foreground"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low-High)</option>
              <option value="price-desc">Price (High-Low)</option>
            </select>
            {/* Custom Caret */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center border border-foreground/20">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-3 transition-colors",
                viewMode === "grid" ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-3 transition-colors border-l border-foreground/20",
                viewMode === "list" ? "bg-foreground text-background" : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: Category Ribbon */}
      <nav className="flex flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
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
      
    </div>
  );
}