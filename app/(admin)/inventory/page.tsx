"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { adjustProductStock } from "@/app/actions/inventory-actions";
import { 
  Plus, Minus, History, Package, ArrowUpDown, ShieldCheck, Loader2, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Calendar, Truck 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12;

export default function AdminInventoryPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Layout & Controls State
  const [activeTab, setActiveTab] = useState<"assets" | "ledger">("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [historyDateFilter, setHistoryDateFilter] = useState("");

  // Pagination State
  const [assetPage, setAssetPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Transaction Form State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Reset pagination when filters or tabs change
  useEffect(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setHistoryDateFilter("");
    setAssetPage(1);
    setHistoryPage(1);
  }, [activeTab]);

  useEffect(() => { setAssetPage(1); }, [searchQuery, statusFilter, sortBy]);
  useEffect(() => { setHistoryPage(1); }, [searchQuery, statusFilter, historyDateFilter]);

  // --- STREAM LIVE INVENTORY & AUDIT LEDGER ---
  const fetchInventoryData = async () => {
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
  };

  useEffect(() => {
    fetchInventoryData();

    // DUAL-TABLE LISTENER: Listens to updates on both ledger logs and the main stock matrix
    const channel = supabase
      .channel("admin-inventory-ledger")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_transactions" },
        () => { fetchInventoryData(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => { fetchInventoryData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // --- SUBMIT TRANSACTION TO SERVER ACTION ---
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      toast.error("Please select an asset and quantity payload.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await adjustProductStock({
        productId: selectedProductId,
        quantity: parseInt(quantity, 10),
        type: transactionType,
        notes: notes,
      });

      if (result.success) {
        toast.success("Transaction written safely to database ledger.");
        setQuantity("");
        setNotes("");
        await fetchInventoryData(); // Failsafe UI sync step
      } else {
        toast.error(`Execution failure: ${result.error}`);
      }
    } catch (err) {
      toast.error("A critical network or server error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CLIENT SIDE SEARCH, SORT, & FILTER LOGIC ---
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = 
        statusFilter === "all" ||
        (statusFilter === "healthy" && (p.current_stock ?? 0) >= 10) ||
        (statusFilter === "low" && (p.current_stock ?? 0) > 0 && (p.current_stock ?? 0) < 10) ||
        (statusFilter === "out" && (p.current_stock ?? 0) <= 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "stock-desc") return (b.current_stock ?? 0) - (a.current_stock ?? 0);
      if (sortBy === "stock-asc") return (a.current_stock ?? 0) - (b.current_stock ?? 0);
      return 0;
    });

  const filteredHistory = history.filter((log) => {
    const assetName = log.products?.name || "";
    const logNotes = log.notes || "";
    const targetTimestamp = log.transaction_date || log.created_at || "";
    
    const matchesSearch = assetName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      logNotes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      statusFilter === "all" ||
      (statusFilter === "in" && log.type === "IN") ||
      (statusFilter === "out" && log.type === "OUT");

    const matchesDate = historyDateFilter === "" || (targetTimestamp && targetTimestamp.startsWith(historyDateFilter));

    return matchesSearch && matchesFilter && matchesDate;
  });

  // --- PAGINATION SLICING ---
  const totalAssetPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedAssets = filteredProducts.slice((assetPage - 1) * ITEMS_PER_PAGE, assetPage * ITEMS_PER_PAGE);

  const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  // --- UTILS ---
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 w-full max-w-full font-sans antialiased text-foreground bg-background">
      
      {/* Branding Header Area */}
      <header className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShieldCheck className="text-primary h-6 w-6 md:h-7 md:w-7" />
              </div>
              Central Inventory Ledger
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
              Production Control Console <span className="text-border text-xs">•</span> Formula: Beginning Stock ± Transaction = Current Stock Cache
            </p>
          </div>

          <Link href="/distributions">
            <Button className="rounded-xl h-10 bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Overall Distributions
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Structural Workplace Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPACT FORM: Action Adjustment Entry Form Matrix */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-5 pt-5 px-6">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 bg-muted rounded-md">
                  <ArrowUpDown className="h-4 w-4 text-foreground" /> 
                </div>
                Post Entry Adjustment
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Write a verified transactional delta record straight to the ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitTransaction} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold block text-muted-foreground">Select Target Asset</label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="rounded-xl border-border/60 focus:ring-2 focus:ring-primary/20 h-10 bg-muted/20 text-xs transition-all">
                      <SelectValue placeholder="Choose an item..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-lg max-h-[260px]">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs rounded-lg cursor-pointer">
                          {p.name} <span className="text-muted-foreground ml-1">(Vol: {p.current_stock ?? 0})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold block text-muted-foreground">Direction Signature</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => setTransactionType("IN")}
                      className={`rounded-xl h-10 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        transactionType === "IN" 
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/10" 
                          : "bg-muted/30 hover:bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" /> Stock In (+)
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setTransactionType("OUT")}
                      className={`rounded-xl h-10 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                        transactionType === "OUT" 
                          ? "bg-destructive hover:bg-destructive/90 text-white shadow-sm shadow-destructive/10" 
                          : "bg-muted/30 hover:bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      <Minus className="h-3.5 w-3.5" /> Stock Out (-)
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold block text-muted-foreground">Quantity (Whole Units)</label>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="e.g., 25"
                    className="rounded-xl h-10 border-border/60 text-xs focus-visible:ring-2 focus-visible:ring-primary/20 bg-muted/20 transition-all"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold block text-muted-foreground">Audit Trail Note / Reason</label>
                  <Textarea 
                    placeholder="e.g., Batch incoming from warehouse"
                    className="rounded-xl min-h-[90px] border-border/60 text-xs bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/20 resize-none transition-all"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-10 bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing Write Pipeline...
                    </>
                  ) : (
                    "Commit Transaction"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT TABLES CONTENT AREA: Dynamic Matrix Layout Display System */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          
          {/* Global Search and Filter Grid Toolbar Layout */}
          <div className="bg-card border border-border/60 p-3 rounded-2xl shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
            
            {/* System Tab Anchors */}
            <div className="flex bg-muted p-1 rounded-xl w-full xl:w-auto">
              <button 
                onClick={() => setActiveTab("assets")}
                className={`flex-1 xl:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === "assets" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-3.5 w-3.5" /> Live Assets
              </button>
              <button 
                onClick={() => setActiveTab("ledger")}
                className={`flex-1 xl:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === "ledger" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-3.5 w-3.5" /> Audit Ledger
              </button>
            </div>

            {/* Input Filter Alignment controls */}
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto xl:justify-end">
              
              <div className="relative flex-grow min-w-[160px] xl:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input 
                  placeholder={activeTab === "assets" ? "Search assets..." : "Search logs..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8.5 h-9 rounded-xl border-border/60 text-xs bg-muted/10 w-full"
                />
              </div>

              {activeTab === "ledger" && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 z-10 pointer-events-none" />
                  <Input
                    type="date"
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    className="pl-8.5 h-9 w-auto rounded-xl border-border/60 text-xs bg-muted/10 cursor-pointer"
                  />
                </div>
              )}

              {activeTab === "assets" && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[130px] rounded-xl border-border/60 text-xs bg-transparent">
                    <SlidersHorizontal className="h-3 w-3 text-muted-foreground mr-1" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="name-asc" className="text-xs">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc" className="text-xs">Name: Z to A</SelectItem>
                    <SelectItem value="stock-desc" className="text-xs">Vol: High - Low</SelectItem>
                    <SelectItem value="stock-asc" className="text-xs">Vol: Low - High</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[125px] rounded-xl border-border/60 text-xs bg-transparent">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  <SelectItem value="all" className="text-xs">All Records</SelectItem>
                  {activeTab === "assets" ? (
                    <>
                      <SelectItem value="healthy" className="text-xs">Healthy</SelectItem>
                      <SelectItem value="low" className="text-xs">Low Volume</SelectItem>
                      <SelectItem value="out" className="text-xs">Out of Stock</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="in" className="text-xs">Ops: IN (+)</SelectItem>
                      <SelectItem value="out" className="text-xs">Ops: OUT (-)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TAB 1 CONTENT CONTAINER: Master Quantities Grid Display */}
          {activeTab === "assets" && (
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md animate-in fade-in duration-150">
              <CardContent className="p-0">
                <div className="overflow-x-auto min-h-[530px]">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-muted/20 text-xs">
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-semibold text-muted-foreground pl-5 h-11">Asset Name</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Category</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">Cached Volume</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right pr-5">Database Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-12 text-center text-xs text-muted-foreground font-mono">
                            No matching inventory items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAssets.map((product) => (
                          <TableRow key={product.id} className="border-b border-border/40 transition-colors hover:bg-muted/20 h-[44px]">
                            <TableCell className="py-2.5 pl-5 text-xs font-medium text-foreground whitespace-nowrap">{product.name}</TableCell>
                            <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">{product.category || "General"}</TableCell>
                            <TableCell className="py-2.5 text-xs text-right font-bold font-mono whitespace-nowrap">{product.current_stock ?? 0}</TableCell>
                            <TableCell className="py-2.5 text-right pr-5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                (product.current_stock ?? 0) <= 0 
                                  ? "bg-destructive/10 text-destructive" 
                                  : (product.current_stock ?? 0) < 10 
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                                  : "bg-green-500/10 text-green-600 dark:text-green-400"
                              }`}>
                                {(product.current_stock ?? 0) <= 0 ? "Out of Stock" : (product.current_stock ?? 0) < 10 ? "Low Volume" : "Healthy"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Control Frame Area */}
                {totalAssetPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/5">
                    <p className="text-[11px] text-muted-foreground">
                      Showing {(assetPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(assetPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} entries
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg border-border/60" onClick={() => setAssetPage(p => Math.max(1, p - 1))} disabled={assetPage === 1}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[11px] font-semibold px-1">Page {assetPage} of {totalAssetPages}</span>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg border-border/60" onClick={() => setAssetPage(p => Math.min(totalAssetPages, p + 1))} disabled={assetPage === totalAssetPages}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2 CONTENT CONTAINER: System Transaction Ledger Auditing System */}
          {activeTab === "ledger" && (
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md animate-in fade-in duration-150">
              <CardContent className="p-0">
                <div className="overflow-x-auto min-h-[530px]">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-muted/20 text-xs">
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-semibold text-muted-foreground pl-5 h-11">Timestamp</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Asset</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-center">Op</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">Qty Delta</TableHead>
                        <TableHead className="font-semibold text-muted-foreground pr-5 pl-5">Audit Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground font-mono">
                            No matching transactional ledger items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedHistory.map((log) => (
                          <TableRow key={log.id} className="border-b border-border/40 hover:bg-muted/20 text-xs h-[44px]">
                            <TableCell className="py-2.5 pl-5 text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                              {formatDateTime(log.transaction_date || log.created_at)}
                            </TableCell>
                            <TableCell className="py-2.5 font-medium text-foreground whitespace-nowrap">{log.products?.name || "Deleted Asset"}</TableCell>
                            <TableCell className="py-2.5 text-center whitespace-nowrap">
                              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${
                                log.type === "IN" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
                              }`}>
                                {log.type}
                              </span>
                            </TableCell>
                            <TableCell className={`py-2.5 text-right font-bold font-mono whitespace-nowrap ${log.type === "IN" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                              {log.type === "IN" ? "+" : "-"}{log.quantity}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs text-muted-foreground max-w-[240px] truncate pr-5 pl-5" title={log.notes}>
                              {log.notes || "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Audit Footer control area */}
                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/5">
                    <p className="text-[11px] text-muted-foreground">
                      Showing {(historyPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(historyPage * ITEMS_PER_PAGE, filteredHistory.length)} of {filteredHistory.length} logs
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg border-border/60" onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[11px] font-semibold px-1">Page {historyPage} of {totalHistoryPages}</span>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg border-border/60" onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}