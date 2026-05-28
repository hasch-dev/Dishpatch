"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { adjustProductStock } from "@/app/actions/inventory-actions";
import { Loader2, Database } from "lucide-react";
import { toast } from "sonner";

import InventoryHeader from "@/components/inventory/inventory-header";
import AdjustmentForm from "@/components/inventory/adjustment-form";
import InventoryToolbar from "@/components/inventory/inventory-toolbar";
import LiveAssetsTable from "@/components/inventory/live-assets-table";
import AuditLedgerTable from "@/components/inventory/audit-ledger-table";

const ITEMS_PER_PAGE = 12;

export default function AdminInventoryPage() {
  const supabase = createClient();
  
  const [products, setProducts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for manual refresh
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Layout & Filter State
  const [activeTab, setActiveTab] = useState<"assets" | "ledger">("assets");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [historyDateFilter, setHistoryDateFilter] = useState("");

  // Search State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [assetPage, setAssetPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Search Debounce Engine
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pagination Resets
  useEffect(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setHistoryDateFilter("");
    setAssetPage(1);
    setHistoryPage(1);
  }, [activeTab]);

  useEffect(() => { setAssetPage(1); }, [debouncedSearch, statusFilter, sortBy]);
  useEffect(() => { setHistoryPage(1); }, [debouncedSearch, statusFilter, historyDateFilter]);

  // --- STANDARD FETCH LOGIC ---
  const fetchInventoryData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    
    const { data: pData } = await supabase
      .from("products")
      .select("id, name, category, current_stock, stock_status, price")
      .order("name");

    const { data: tData } = await supabase
      .from("inventory_transactions")
      .select(`
        id,
        quantity,
        type,
        created_at,
        transaction_date,
        notes,
        products ( name ),
        user_id
      `)
      .order("created_at", { ascending: false })
      .limit(500);

    if (pData) setProducts(pData);
    if (tData) setHistory(tData);
    
    setIsLoading(false);
    if (showRefreshIndicator) setIsRefreshing(false);
  };

  // Only fetch once on initial mount (WebSockets removed)
  useEffect(() => {
    fetchInventoryData();
  }, [supabase]);

  // Handle Transaction Submit (Fetches fresh data automatically after a successful post)
  const handleTransactionSubmit = async (payload: { productId: string; quantity: number; type: "IN" | "OUT"; notes: string }) => {
    setIsSubmitting(true);
    try {
      const result = await adjustProductStock(payload);
      if (result.success) {
        toast.success("Transaction written safely to database ledger.");
        await fetchInventoryData(); // Refresh data quietly in background
        return true;
      } else {
        toast.error(`Execution failure: ${result.error}`);
        return false;
      }
    } catch (err) {
      toast.error("A critical network error occurred.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MEMOIZED DATA PIPELINES (Kept for instant search/filtering) ---
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = debouncedSearch.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(query) || 
          (p.category && p.category.toLowerCase().includes(query));
        
        const stock = p.current_stock ?? 0;
        const matchesFilter = 
          statusFilter === "all" ||
          (statusFilter === "healthy" && stock >= 10) ||
          (statusFilter === "low" && stock > 0 && stock < 10) ||
          (statusFilter === "out" && stock <= 0);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "stock-desc") return (b.current_stock ?? 0) - (a.current_stock ?? 0);
        if (sortBy === "stock-asc") return (a.current_stock ?? 0) - (b.current_stock ?? 0);
        return 0;
      });
  }, [products, debouncedSearch, statusFilter, sortBy]);

  const filteredHistory = useMemo(() => {
    return history.filter((log) => {
      const query = debouncedSearch.toLowerCase();
      const assetName = log.products?.name || "";
      const logNotes = log.notes || "";
      const targetTimestamp = log.transaction_date || log.created_at || "";
      
      const matchesSearch = assetName.toLowerCase().includes(query) || 
        logNotes.toLowerCase().includes(query);

      const matchesFilter = 
        statusFilter === "all" ||
        (statusFilter === "in" && log.type === "IN") ||
        (statusFilter === "out" && log.type === "OUT");

      const matchesDate = historyDateFilter === "" || (targetTimestamp && targetTimestamp.startsWith(historyDateFilter));

      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [history, debouncedSearch, statusFilter, historyDateFilter]);

  const paginatedAssets = useMemo(() => {
    return filteredProducts.slice((assetPage - 1) * ITEMS_PER_PAGE, assetPage * ITEMS_PER_PAGE);
  }, [filteredProducts, assetPage]);

  const paginatedHistory = useMemo(() => {
    return filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);
  }, [filteredHistory, historyPage]);

  const totalAssetPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE) || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background w-full gap-5">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground tracking-wide">
            Loading ledger data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-full font-sans antialiased text-foreground bg-background min-h-screen">
      <InventoryHeader />

      <div className="flex flex-col gap-8 w-full items-stretch">
        <AdjustmentForm 
          products={products}
          isSubmitting={isSubmitting}
          onSubmitTransaction={handleTransactionSubmit}
        />

        <div className="space-y-5 w-full">
          <InventoryToolbar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            historyDateFilter={historyDateFilter}
            setHistoryDateFilter={setHistoryDateFilter}
            onRefresh={() => fetchInventoryData(true)} // Passed down to toolbar
            isRefreshing={isRefreshing}
          />

          {activeTab === "assets" ? (
            <LiveAssetsTable 
              assets={paginatedAssets}
              filteredCount={filteredProducts.length}
              currentPage={assetPage}
              totalPages={totalAssetPages}
              onPageChange={setAssetPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          ) : (
            <AuditLedgerTable 
              history={paginatedHistory}
              filteredCount={filteredHistory.length}
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              onPageChange={setHistoryPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </div>
    </div>
  );
}