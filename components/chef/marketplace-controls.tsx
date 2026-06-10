"use client";

import { Search, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const TYPE_FILTERS = [
  { value: "all", label: "All Formats" },
  { value: "private", label: "Private Chef" },
  { value: "consultation", label: "Consultation" },
];

export default function MarketplaceControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  typeFilter,
  setTypeFilter,
  viewMode,
  setViewMode,
}: MarketplaceControlsProps) {
  return (
    <div className="mb-8 p-4 border border-border/20 bg-card/40 backdrop-blur-sm flex flex-col lg:flex-row gap-4 items-center justify-between rounded-none font-sans">
      {/* Search Input Node */}
      <div className="relative w-full lg:max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search ledger by title, client, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border border-border/40 focus:border-primary/50 h-10 pl-10 pr-4 text-xs tracking-wide placeholder:text-muted-foreground/40 rounded-none outline-none transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-4 justify-end">
        {/* Format Selector Pills */}
        <div className="flex items-center gap-1 bg-background border border-border/40 p-1 h-10 rounded-none w-full sm:w-auto overflow-x-auto">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={cn(
                "px-4 h-full text-[9px] uppercase font-black tracking-widest transition-all rounded-none whitespace-nowrap",
                typeFilter === type.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown & View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center bg-background border border-border/40 h-10 px-3 gap-2 group rounded-none w-full sm:w-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[10px] uppercase font-black tracking-widest text-foreground outline-none cursor-pointer pr-6 rounded-none appearance-none font-sans"
            >
              <option value="created_desc" className="bg-card text-foreground">Logged (Newest)</option>
              <option value="created_asc" className="bg-card text-foreground">Logged (Oldest)</option>
              <option value="event_asc" className="bg-card text-foreground">Event Date (Soonest)</option>
              <option value="event_desc" className="bg-card text-foreground">Event Date (Latest)</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-muted-foreground/60 text-[8px]">▼</div>
          </div>

          {/* Precision View Matrix Switch */}
          <div className="flex items-center bg-background border border-border/40 h-10 p-1 gap-0.5 rounded-none">
            <button 
              onClick={() => setViewMode('grid')}
              title="Matrix Grid View"
              className={cn(
                "h-full px-2.5 transition-colors rounded-none",
                viewMode === 'grid' ? "bg-muted/60 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              title="High-Density List View"
              className={cn(
                "h-full px-2.5 transition-colors rounded-none",
                viewMode === 'list' ? "bg-muted/60 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}