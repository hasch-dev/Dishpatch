"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Truck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import MatrixControls from "@/components/distributions/matrix-controls";
import MatrixTable from "@/components/distributions/matrix-table";

export default function DistributionsPage() {
  const supabase = createClient();
  
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedMonth, setSelectedMonth] = useState(5); 
  const [selectedYear, setSelectedYear] = useState(2026); 

  useEffect(() => {
    async function loadLogMatrices() {
      setIsLoading(true);
      
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, category"); // We no longer fetch current_stock

      const { data: txnData } = await supabase
        .from("inventory_transactions")
        .select("product_id, quantity, type, created_at, transaction_date")
        .order("created_at", { ascending: true });

      if (productsData) setProducts(productsData);
      if (txnData) setTransactions(txnData);
      
      setIsLoading(false);
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

  // --- REBUILT FORWARD-CALCULATION MATRIX ENGINE ---
  const calculatedMatrixRows = useMemo(() => {
    const startOfMonth = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0));

    return products.map((product) => {
      const productTxns = transactions.filter((t) => t.product_id === product.id);

      // 1. Calculate true starting balance based PURELY on historical logs before this month
      let startingStockAtMonthBeginning = 0;

      productTxns.forEach((t) => {
        const txnDate = new Date(t.transaction_date || t.created_at);
        if (txnDate < startOfMonth) {
          if (t.type === "IN") startingStockAtMonthBeginning += t.quantity;
          else if (t.type === "OUT") startingStockAtMonthBeginning -= t.quantity;
        }
      });

      // 2. Build daily map stepping forward day-by-day
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background w-full gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Constructing historical ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-full font-sans antialiased text-foreground bg-background">
      <header className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Ledger
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3.5 text-foreground">
              <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm">
                <Truck className="text-primary h-6 w-6" />
              </div>
              Monthly Distribution Matrix
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Historical ledger grid tracking exact structural stock states over daily intervals.
            </p>
          </div>
        </div>
      </header>

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
    </div>
  );
}