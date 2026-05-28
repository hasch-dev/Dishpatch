"use client";

import { Search, Calendar, SlidersHorizontal, Package, History, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface InventoryToolbarProps {
  activeTab: "assets" | "ledger";
  setActiveTab: (val: "assets" | "ledger") => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  historyDateFilter: string;
  setHistoryDateFilter: (val: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function InventoryToolbar({
  activeTab, setActiveTab,
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  sortBy, setSortBy,
  historyDateFilter, setHistoryDateFilter,
  onRefresh, isRefreshing
}: InventoryToolbarProps) {
  return (
    <div className="bg-card/40 border border-border/40 p-3 rounded-xl shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between w-full">
      
      {/* Tabs Layout */}
      <div className="flex bg-muted/60 p-1 rounded-lg w-full xl:w-auto border border-border/10">
        <button 
          onClick={() => setActiveTab("assets")}
          className={`flex-1 xl:flex-none px-6 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "assets" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-3.5 w-3.5" strokeWidth={2} /> Live Metrics
        </button>
        <button 
          onClick={() => setActiveTab("ledger")}
          className={`flex-1 xl:flex-none px-6 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === "ledger" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-3.5 w-3.5" strokeWidth={2} /> Operational Logs
        </button>
      </div>

      {/* Inputs Alignment Block */}
      <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto xl:justify-end">
        
        <div className="relative flex-grow min-w-[180px] xl:w-60">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input 
            placeholder={activeTab === "assets" ? "Search current inventory..." : "Search data stream history..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-lg border-border/50 bg-background/50 text-sm focus-visible:ring-primary/20 w-full"
          />
        </div>

        {activeTab === "ledger" && (
          <div className="relative bg-background/50 rounded-lg border border-border/50 pr-1">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <Input
              type="date"
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
              className="pl-10 h-11 border-0 bg-transparent text-sm cursor-pointer focus-visible:ring-0 w-[145px]"
            />
          </div>
        )}

        {activeTab === "assets" && (
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11 w-[140px] rounded-lg border-border/50 bg-background/50 text-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <SelectValue placeholder="Sort Items" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="name-asc" className="rounded-md">Name: A to Z</SelectItem>
              <SelectItem value="name-desc" className="rounded-md">Name: Z to A</SelectItem>
              <SelectItem value="stock-desc" className="rounded-md">Stock: High to Low</SelectItem>
              <SelectItem value="stock-asc" className="rounded-md">Stock: Low to High</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-[140px] rounded-lg border-border/50 bg-background/50 text-sm">
            <SelectValue placeholder="Filter Layer" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="all" className="rounded-md">All Dimensions</SelectItem>
            {activeTab === "assets" ? (
              <>
                <SelectItem value="healthy" className="rounded-md">Healthy Balance</SelectItem>
                <SelectItem value="low" className="rounded-md">Low Volume</SelectItem>
                <SelectItem value="out" className="rounded-md">Out of Stock</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="in" className="rounded-md">Ops: Inflow (+)</SelectItem>
                <SelectItem value="out" className="rounded-md">Ops: Outflow (-)</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {/* Gmail-Style Manual Refresh Button */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-11 w-11 rounded-lg border-border/50 bg-background/50 text-muted-foreground hover:text-foreground"
          title="Sync with database"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>
    </div>
  );
}