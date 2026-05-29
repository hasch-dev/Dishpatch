"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Truck, ArrowLeft, Loader2, Database, BarChart3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MatrixControls from "@/components/distributions/matrix-controls";
import MatrixTable from "@/components/distributions/matrix-table";
import DistributionStats from "@/components/distributions/distribution-stats";

export default function DistributionsPage() {
  const supabase = createClient();
  
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("matrix");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedMonth, setSelectedMonth] = useState(5); 
  const [selectedYear, setSelectedYear] = useState(2026); 

  useEffect(() => {
    async function loadLogMatrices() {
      try {
        setIsLoading(true);
        
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, category"); 

        const { data: txnData } = await supabase
          .from("inventory_transactions")
          .select("product_id, quantity, type, created_at, transaction_date")
          .order("created_at", { ascending: true });

        if (productsData) setProducts(productsData);
        if (txnData) setTransactions(txnData);
      } catch (error) {
        console.error("Failed to compile distribution ledger:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogMatrices();
  }, [supabase]);

  const daysInMonthArray = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  const monthLabel = useMemo(() => {
    return new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("en-US", { month: "short" });
  }, [selectedMonth, selectedYear]);

  // --- REBUILT MATRIX ENGINE WITH ALL-TIME REMAINING STOCK BALANCE ---
  const calculatedMatrixRows = useMemo(() => {
    const startOfMonth = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0));

    return products.map((product) => {
      const productTxns = transactions.filter((t) => t.product_id === product.id);

      let startingStockAtMonthBeginning = 0;
      let totalRemainingStock = 0; // Cumulative all-time stock check

      productTxns.forEach((t) => {
        const txnDate = new Date(t.transaction_date || t.created_at);
        
        // Compute Historical Stock Up to Selected Month Beginning
        if (txnDate < startOfMonth) {
          if (t.type === "IN") startingStockAtMonthBeginning += t.quantity;
          else if (t.type === "OUT") startingStockAtMonthBeginning -= t.quantity;
        }

        // Compute Absolute Current Total Stock Engine
        if (t.type === "IN") totalRemainingStock += t.quantity;
        else if (t.type === "OUT") totalRemainingStock -= t.quantity;
      });

      const dailyMap: Record<number, { beg: number; inQty: number; outQty: number; end: number }> = {};
      let runningBegStock = startingStockAtMonthBeginning;
      let monthlyTotalOut = 0;

      daysInMonthArray.forEach((day) => {
        const dayStart = new Date(Date.UTC(selectedYear, selectedMonth - 1, day, 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(selectedYear, selectedMonth - 1, day, 23, 59, 59, 999));

        const dayTxns = productTxns.filter((t) => {
          const d = new Date(t.transaction_date || t.created_at);
          return d >= dayStart && d <= dayEnd;
        });

        const dayIn = dayTxns.filter((t) => t.type === "IN").reduce((acc, t) => acc + t.quantity, 0);
        const dayOut = dayTxns.filter((t) => t.type === "OUT").reduce((acc, t) => acc + t.quantity, 0);
        const dayClosing = runningBegStock + dayIn - dayOut;

        dailyMap[day] = {
          beg: runningBegStock,
          inQty: dayIn,
          outQty: dayOut,
          end: dayClosing,
        };

        monthlyTotalOut += dayOut;
        runningBegStock = dayClosing; 
      });

      return {
        id: product.id,
        name: product.name,
        category: product.category || "General",
        dailyMap,
        monthlyTotalOut,
        totalRemainingStock, // Sent downstream to components
      };
    });
  }, [products, transactions, selectedMonth, selectedYear, daysInMonthArray]);

  const processedRows = useMemo(() => {
    return calculatedMatrixRows
      .filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "volume-desc") return b.monthlyTotalOut - a.monthlyTotalOut;
        return 0;
      });
  }, [calculatedMatrixRows, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background w-full gap-5">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
           <Database className="h-7 w-7 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            Constructing historical distribution ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 w-full max-w-full font-sans antialiased text-foreground bg-background min-h-screen">
      
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-4">
          <Link href="/inventory" className="group">
            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-muted-foreground group-hover:text-foreground transition-colors rounded-xl font-medium">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Back to Ledger
            </Button>
          </Link>
          
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <Truck className="text-primary h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-foreground">
                Distribution Hub
              </h1>
              <div className="flex items-center gap-2.5 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Metrics System Synchronized
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Mode Swapper */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl h-12 w-full md:w-[320px] border border-border/50">
            <TabsTrigger value="matrix" className="rounded-xl font-medium text-xs tracking-wide data-[state=active]:shadow-sm flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" />
              Log Matrix
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl font-medium text-xs tracking-wide data-[state=active]:shadow-sm flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Volume Stats
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <Tabs value={activeTab} className="w-full">
        {/* TAB WORKSPACE 1: THE LEDGER MATRIX GRID */}
        <TabsContent value="matrix" className="space-y-6 mt-0 outline-none">
          <MatrixControls 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />

          <MatrixTable 
            products={processedRows}
            daysInMonth={daysInMonthArray}
            monthLabel={monthLabel}
          />
        </TabsContent>

        {/* TAB WORKSPACE 2: THE INTERACTIVE INSIGHTS COMPONENT */}
        <TabsContent value="stats" className="mt-0 outline-none">
          <DistributionStats products={products} transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}