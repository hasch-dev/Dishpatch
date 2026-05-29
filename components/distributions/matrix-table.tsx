"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DayData {
  beg: number;
  inQty: number;
  outQty: number;
  end: number;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  dailyMap: Record<number, DayData>;
  monthlyTotalOut: number;
  totalRemainingStock: number;
}

interface MatrixTableProps {
  products: ProductRow[];
  daysInMonth: number[];
  monthLabel: string;
}

export default function MatrixTable({ products, daysInMonth, monthLabel }: MatrixTableProps) {
  return (
    <Card className="rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden bg-card/30 backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full max-w-full data-scrollbar">
          <table className="w-max min-w-full border-collapse text-left">
            
            <thead className="bg-muted/20 border-b border-border/40 select-none text-center sticky top-0 z-20">
              <tr className="border-b border-border/20 divide-x divide-border/20">
                <th className="p-5 text-left font-semibold text-foreground text-sm w-[300px] sticky left-0 bg-background/95 backdrop-blur-md z-30" rowSpan={2}>
                  Registry Asset Information
                </th>
                {daysInMonth.map((day) => (
                  <th key={day} colSpan={4} className="p-3 text-center font-semibold text-muted-foreground/80 tracking-[0.15em] uppercase text-[10px] min-w-[220px]">
                    {monthLabel} {day}
                  </th>
                ))}
                <th className="p-5 text-center font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 text-xs min-w-[140px] sticky right-0 z-30 shadow-[-4px_0_12px_rgba(0,0,0,0.03)]" rowSpan={2}>
                  Total Dispatched
                </th>
              </tr>
              
              <tr className="divide-x divide-border/20 text-[9px] font-bold tracking-[0.2em] uppercase bg-muted/10">
                {daysInMonth.map((day) => (
                  <React.Fragment key={`sub-${day}`}>
                    <th className="py-2.5 text-emerald-600/80 dark:text-emerald-400/80 text-center min-w-[55px]">BEG</th>
                    <th className="py-2.5 text-muted-foreground/60 text-center min-w-[55px]">IN</th>
                    <th className="py-2.5 text-muted-foreground/60 text-center min-w-[55px]">OUT</th>
                    <th className="py-2.5 text-rose-600/80 dark:text-rose-400/80 text-center min-w-[55px]">END</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/20 bg-background/40 font-sans tabular-nums text-[13px]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={(daysInMonth.length * 4) + 2} className="p-24 text-center text-sm text-muted-foreground font-medium">
                    No registry assets match your current parameters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors duration-300 divide-x divide-border/10 h-16">
                    
                    {/* Item Sticky Primary Column containing dynamic inventory checks */}
                    <td className="px-5 py-3 font-medium text-foreground sticky left-0 bg-background/95 backdrop-blur-md z-10 w-[300px] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.03)]">
                      <span className="block truncate text-sm font-semibold tracking-tight text-foreground">{product.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">
                          {product.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className={`text-[10px] font-mono font-bold ${
                          product.totalRemainingStock <= 0 
                            ? "text-rose-500" 
                            : product.totalRemainingStock <= 10 
                            ? "text-amber-500" 
                            : "text-emerald-500"
                        }`}>
                          Stock: {product.totalRemainingStock} remaining
                        </span>
                      </div>
                    </td>

                    {/* Daily Balance Cells */}
                    {daysInMonth.map((day) => {
                      const dayMetrics = product.dailyMap[day] || { beg: 0, inQty: 0, outQty: 0, end: 0 };
                      return (
                        <React.Fragment key={`cell-${product.id}-${day}`}>
                          <td className="p-2 text-center font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.01]">
                            {dayMetrics.beg}
                          </td>
                          <td className={`p-2 text-center transition-all ${dayMetrics.inQty > 0 ? "font-semibold text-foreground bg-muted/30" : "text-muted-foreground/20 font-normal"}`}>
                            {dayMetrics.inQty || "—"}
                          </td>
                          <td className={`p-2 text-center transition-all ${dayMetrics.outQty > 0 ? "font-semibold text-foreground bg-muted/30" : "text-muted-foreground/20 font-normal"}`}>
                            {dayMetrics.outQty || "—"}
                          </td>
                          <td className="p-2 text-center font-medium text-rose-600 dark:text-rose-400 bg-rose-500/[0.01]">
                            {dayMetrics.end}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td className="px-5 py-3 text-center text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 font-bold sticky right-0 bg-background/95 backdrop-blur-md z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] text-sm">
                      {product.monthlyTotalOut}
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </CardContent>
    </Card>
  );
}