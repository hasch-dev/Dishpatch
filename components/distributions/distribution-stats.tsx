"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, CalendarDays, CheckCircle2, ShoppingBag, BarChart2, PieChart, LineChart as LineChartIcon } from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

interface Product {
  id: string;
  name: string;
  category: string;
}

interface Transaction {
  product_id: string;
  quantity: number;
  type: "IN" | "OUT";
  created_at: string;
  transaction_date?: string;
}

interface DistributionStatsProps {
  products: Product[];
  transactions: Transaction[];
}

type Timeframe = "monthly" | "quarterly" | "biannually" | "yearly";

// Colors for the Pie Chart slices
const PIE_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#ec4899'];

export default function DistributionStats({ products, transactions }: DistributionStatsProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);
  const [chartType, setChartType] = useState("bar");

  // Parse time keys based on what timeframe the user selected
  const getPeriodKey = (dateStr: string, mode: Timeframe) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    if (isNaN(year)) return "Unknown";

    if (mode === "yearly") return `${year}`;
    if (mode === "biannually") {
      const half = d.getMonth() < 6 ? "1st Half (Jan-Jun)" : "2nd Half (Jul-Dec)";
      return `${half} ${year}`;
    }
    if (mode === "quarterly") {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${year}`;
    }
    // Default Monthly
    const month = d.toLocaleString("en-US", { month: "short" });
    return `${month} ${year}`;
  };

  // Calculate the total volume for each item across all periods
  const volumeAggregations = useMemo(() => {
    const outTransactions = transactions.filter((t) => t.type === "OUT");
    
    const aggregationMap: Record<string, Record<string, number>> = {};
    const periodsSet = new Set<string>();

    outTransactions.forEach((t) => {
      const targetDate = t.transaction_date || t.created_at;
      const periodKey = getPeriodKey(targetDate, timeframe);
      periodsSet.add(periodKey);

      if (!aggregationMap[t.product_id]) {
        aggregationMap[t.product_id] = {};
      }
      aggregationMap[t.product_id][periodKey] = (aggregationMap[t.product_id][periodKey] || 0) + t.quantity;
    });

    return {
      matrix: aggregationMap,
      // Sort oldest to newest for the graphs to flow naturally left to right
      allPeriods: Array.from(periodsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()), 
    };
  }, [transactions, timeframe]);

  // Set up the data for the left sidebar list
  const aggregatedProductRows = useMemo(() => {
    return products.map((p) => {
      const periodsVolumeMap = volumeAggregations.matrix[p.id] || {};
      const totalVolumeOut = Object.values(periodsVolumeMap).reduce((sum, val) => sum + val, 0);

      return {
        ...p,
        periodsVolumeMap,
        totalVolumeOut,
      };
    })
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.totalVolumeOut - a.totalVolumeOut);
  }, [products, volumeAggregations, searchQuery]);

  // Set up the specific data for the charts on the right side
  const activeProductData = useMemo(() => {
    if (!selectedProductId) return null;
    const item = products.find((p) => p.id === selectedProductId);
    if (!item) return null;

    const periodsVolumeMap = volumeAggregations.matrix[item.id] || {};
    const timelineData = volumeAggregations.allPeriods.map((period) => ({
      period,
      volume: periodsVolumeMap[period] || 0,
    }));

    const highVolumeRecord = timelineData.length > 0 
      ? Math.max(...timelineData.map((t) => t.volume), 0)
      : 0;

    const aggregateLifetimeOut = timelineData.reduce((sum, t) => sum + t.volume, 0);

    return {
      ...item,
      timelineData,
      highVolumeRecord,
      aggregateLifetimeOut,
    };
  }, [selectedProductId, products, volumeAggregations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      
      {/* LEFT SIDE: SELECTION LIST */}
      <div className="lg:col-span-4 space-y-4 w-full">
        <Card className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-lg font-bold tracking-tight">Item List</CardTitle>
            <CardDescription className="text-xs">Choose a timeframe and pick an item to view its stats.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            
            {/* Simple Time Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-muted/60 border border-border/40 rounded-xl">
              {(["monthly", "quarterly", "biannually", "yearly"] as Timeframe[]).map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeframe(mode)}
                  className={`capitalize text-[10px] font-bold tracking-wider rounded-lg h-8 transition-all px-1 ${
                    timeframe === mode 
                      ? "bg-background shadow-sm text-foreground hover:bg-background" 
                      : "text-muted-foreground hover:bg-background/30"
                  }`}
                >
                  {mode === "biannually" ? "6-Months" : mode}
                </Button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search for an item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl border-border/50 bg-background/50"
              />
            </div>

            {/* Scrollable List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto data-scrollbar pr-1">
              {aggregatedProductRows.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No items found.</p>
              ) : (
                aggregatedProductRows.map((item) => {
                  const isSelected = item.id === selectedProductId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProductId(item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "border-primary bg-primary/[0.03] shadow-sm"
                          : "border-border/40 bg-background/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="max-w-[70%]">
                        <h4 className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="text-sm font-bold text-foreground block">
                          {item.totalVolumeOut}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                          Total Sent
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT SIDE: STATS & GRAPHS */}
      <div className="lg:col-span-8 w-full">
        {activeProductData ? (
          <div className="space-y-6">
            
            {/* Plain English Summary Header */}
            <Card className="rounded-3xl border border-border/30 bg-gradient-to-br from-card to-muted/10 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart2 className="w-32 h-32" />
              </div>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                    Currently Viewing
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">
                    {activeProductData.name}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Category: {activeProductData.category}
                  </p>
                </div>

                {/* Easy-to-read Stat Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/40 pt-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShoppingBag className="w-4 h-4 text-primary/70" />
                      <span className="text-xs font-bold uppercase tracking-wider">Total Distributed</span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                      {activeProductData.aggregateLifetimeOut}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-emerald-500/70" />
                      <span className="text-xs font-bold uppercase tracking-wider">Highest Output</span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                      {activeProductData.highVolumeRecord}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500/70" />
                      <span className="text-xs font-bold uppercase tracking-wider">Active Periods</span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight tabular-nums text-indigo-600 dark:text-indigo-400">
                      {activeProductData.timelineData.filter(t => t.volume > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Graphs Section */}
            <Card className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="p-6 pb-2 border-b border-border/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Distribution History
                </CardTitle>
                
                {/* Graph Style Selector */}
                <Tabs value={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-3 h-9 bg-muted/50 rounded-lg">
                    <TabsTrigger value="bar" className="text-xs font-medium rounded-md flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5" /> Bar
                    </TabsTrigger>
                    <TabsTrigger value="line" className="text-xs font-medium rounded-md flex items-center gap-1.5">
                      <LineChartIcon className="w-3.5 h-3.5" /> Trend
                    </TabsTrigger>
                    <TabsTrigger value="pie" className="text-xs font-medium rounded-md flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5" /> Share
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-6">
                {activeProductData.timelineData.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-16">
                    No history found for this item yet.
                  </p>
                ) : (
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      
                    
                      {chartType === "bar" ? (
                        <BarChart data={activeProductData.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip 
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                          />
                          <Bar dataKey="volume" name="Units Sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>

                      
                      ) : chartType === "line" ? (
                        <LineChart data={activeProductData.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                          <XAxis dataKey="period" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                          />
                          <Line type="monotone" dataKey="volume" name="Units Sent" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>

                      
                      ) : (
                        <RechartsPieChart>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                          <Pie
                            data={activeProductData.timelineData.filter(d => d.volume > 0)} // Only show slices with actual volume
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="volume"
                            nameKey="period"
                          >
                            {activeProductData.timelineData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      )}

                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        ) : (
          <Card className="rounded-3xl border border-dashed border-border p-16 text-center h-full flex flex-col justify-center items-center">
            <BarChart2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-base text-muted-foreground font-medium">
              Select an item from the list on the left to see its graphs and stats.
            </p>
          </Card>
        )}
      </div>

    </div>
  );
}