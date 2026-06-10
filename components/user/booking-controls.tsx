"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

// Map your exact Supabase database values to the UI labels here
const TYPE_FILTERS = [
  { value: "all", label: "All Formats" },
  { value: "private", label: "Private Chef" }, // <-- Change "private" to match your DB (e.g. "private_chef")
  { value: "consultation", label: "Consultation" },
];

export default function BookingControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  typeFilter,
  setTypeFilter,
}: BookingControlsProps) {
  return (
    <div className="mb-10 p-4 border border-border/20 bg-card/40 backdrop-blur-sm flex flex-col lg:flex-row gap-4 items-center justify-between rounded-none">
      {/* Dynamic Search Node */}
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

      {/* Control CTA parameters */}
      <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-4 justify-end">
        {/* Fine-grain Type Filter Array */}
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

        {/* Sort Pipeline Selector */}
        <div className="relative flex items-center bg-background border border-border/40 h-10 px-3 gap-2 group rounded-none w-full sm:w-auto shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-[10px] uppercase font-black tracking-widest text-foreground outline-none cursor-pointer pr-6 rounded-none appearance-none font-sans"
          >
            <option value="created_desc" className="bg-card text-foreground">Date Logged (Newest)</option>
            <option value="created_asc" className="bg-card text-foreground">Date Logged (Oldest)</option>
            <option value="event_desc" className="bg-card text-foreground">Event Date (Latest)</option>
            <option value="event_asc" className="bg-card text-foreground">Event Date (Earliest)</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-muted-foreground/60 text-[8px]">▼</div>
        </div>
      </div>
    </div>
  );
}