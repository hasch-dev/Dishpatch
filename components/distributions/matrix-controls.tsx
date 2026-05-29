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
  selectedMonth: number; 
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
    <div className="bg-card/40 border border-border/40 p-3 md:p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-border/60 transition-all flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
      
      {/* Search Input */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input 
          placeholder="Search products in matrix grid..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 text-sm focus-visible:ring-primary/20 w-full transition-all"
        />
      </div>

      {/* Selectors Group */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
        
        {/* Month Selector */}
        <div className="flex items-center bg-background/50 rounded-2xl border border-border/50 pr-1 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <div className="pl-3.5 pr-1 py-3 text-primary/80">
            <Calendar className="h-4 w-4" />
          </div>
          <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
            <SelectTrigger className="h-12 w-[130px] border-0 focus:ring-0 text-sm bg-transparent px-2">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)} className="rounded-xl">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector */}
        <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
          <SelectTrigger className="h-12 w-[100px] rounded-2xl border-border/50 bg-background/50 text-sm focus:ring-primary/20 transition-all">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)} className="rounded-xl">{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-[1px] h-8 bg-border/40 mx-2 hidden sm:block" />

        {/* Sort Controls */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-12 w-[180px] rounded-2xl border-border/50 bg-background/50 text-sm focus:ring-primary/20 transition-all">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Sort Method" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="name-asc" className="rounded-xl">Name: A to Z</SelectItem>
            <SelectItem value="name-desc" className="rounded-xl">Name: Z to A</SelectItem>
            <SelectItem value="volume-desc" className="rounded-xl">Highest Volume Out</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </div>
  );
}