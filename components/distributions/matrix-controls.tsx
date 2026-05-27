"use client";

import { Search, Calendar, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface MatrixControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedMonth: number; // 1-12
  setSelectedMonth: (val: number) => void;
  selectedYear: number;
  setSelectedYear: (val: number) => void;
}

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
];

const YEARS = [2025, 2026, 2027];

export default function MatrixControls({
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  selectedMonth, setSelectedMonth,
  selectedYear, setSelectedYear
}: MatrixControlsProps) {
  return (
    <div className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
      
      {/* Search Input - Expanded max-w and shifted to h-10 */}
      <div className="relative w-full lg:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search inventory items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 rounded-xl border-border/60 text-xs sm:text-sm bg-muted/10 w-full"
        />
      </div>

      {/* Selectors and Sorting Matrix - Relaxed gaps for cleaner separation */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
        
        {/* Month Selector - Upgraded trigger size and expanded width constraint */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary mr-0.5" />
          <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-border/60 text-xs sm:text-sm bg-transparent px-3">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs sm:text-sm">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)} className="text-xs sm:text-sm">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector - Shifted to h-10 */}
        <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
          <SelectTrigger className="h-10 w-[95px] rounded-xl border-border/60 text-xs sm:text-sm bg-transparent px-3">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs sm:text-sm">
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)} className="text-xs sm:text-sm">{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Scaled structural divider height to match the h-10 elements */}
        <div className="w-[1px] h-6 bg-border/60 mx-1 hidden sm:block" />

        {/* Sort Controls - Expanded to w-[160px] to give text clean alignment */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/60 text-xs sm:text-sm bg-transparent px-3">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
            <SelectValue placeholder="Sort Rows" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs sm:text-sm">
            <SelectItem value="name-asc" className="text-xs sm:text-sm">Name: A to Z</SelectItem>
            <SelectItem value="name-desc" className="text-xs sm:text-sm">Name: Z to A</SelectItem>
            <SelectItem value="volume-desc" className="text-xs sm:text-sm">Total Out: High-Low</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </div>
  );
}