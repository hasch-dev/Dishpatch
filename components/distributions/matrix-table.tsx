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
}

interface MatrixTableProps {
  products: ProductRow[];
  daysInMonth: number[];
  monthLabel: string;
}

export default function MatrixTable({ products, daysInMonth, monthLabel }: MatrixTableProps) {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-card/60 backdrop-blur-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full max-w-full data-scrollbar">
          <table className="w-max min-w-full border-collapse text-xs font-medium text-left">
            
            {/* LEVEL 1 & LEVEL 2 NESTED HEADERS */}
            <thead className="bg-muted/40 border-b border-border/60 select-none text-center sticky top-0 z-20">
              <tr className="border-b border-border/40 divide-x divide-border/40">
                <th className="p-3.5 text-left font-bold text-foreground text-xs w-[260px] sticky left-0 bg-muted/95 backdrop-blur-md z-30" rowSpan={2}>
                  Item Name
                </th>
                {daysInMonth.map((day) => (
                  <th key={day} colSpan={4} className="p-2 text-center font-bold text-muted-foreground/90 font-mono tracking-wide min-w-[200px] bg-muted/20">
                    {monthLabel} {day}
                  </th>
                ))}
                <th className="p-3.5 text-center font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 text-xs min-w-[120px] sticky right-0 z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]" rowSpan={2}>
                  Total Out
                </th>
              </tr>
              
              <tr className="divide-x divide-border/40 text-[10px] font-black tracking-wider bg-muted/10">
                {daysInMonth.map((day) => (
                  <React.Fragment key={`sub-${day}`}>
                    <th className="py-1.5 text-green-600 dark:text-green-400 bg-green-500/10 text-center min-w-[50px]">BEG</th>
                    <th className="py-1.5 text-muted-foreground/70 text-center min-w-[50px]">IN</th>
                    <th className="py-1.5 text-muted-foreground/70 text-center min-w-[50px]">OUT</th>
                    <th className="py-1.5 text-red-600 dark:text-red-400 bg-red-500/15 text-center min-w-[50px]">END</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* LIVE DATA GRID ROW SYSTEM */}
            <tbody className="divide-y divide-border/40 bg-background/50 font-mono text-[11.5px]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={(daysInMonth.length * 4) + 2} className="p-16 text-center text-xs text-muted-foreground font-sans italic">
                    No records found matching the current search parameters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/10 transition-colors divide-x divide-border/40 h-11">
                    
                    {/* Item Sticky Primary Column */}
                    <td className="p-3 font-sans font-semibold text-foreground text-xs sticky left-0 bg-background/95 backdrop-blur-sm z-10 w-[260px] truncate shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {product.name}
                    </td>

                    {/* Sequential Daily Data Renderer */}
                    {daysInMonth.map((day) => {
                      const dayMetrics = product.dailyMap[day] || { beg: 0, inQty: 0, outQty: 0, end: 0 };
                      const hasIn = dayMetrics.inQty > 0;
                      const hasOut = dayMetrics.outQty > 0;
                      
                      return (
                        <React.Fragment key={`cell-${product.id}-${day}`}>
                          {/* BEG Column Cell */}
                          <td className="p-2 text-center font-semibold text-green-600 dark:text-green-400 bg-green-500/[0.03]">
                            {dayMetrics.beg}
                          </td>

                          {/* IN Column Cell (Subtle Neutral Highlight when active) */}
                          <td className={`p-2 text-center transition-all ${
                            hasIn 
                              ? "font-bold text-foreground bg-muted/80" 
                              : "text-muted-foreground/30"
                          }`}>
                            {dayMetrics.inQty || "—"}
                          </td>

                          {/* OUT Column Cell (Subtle Neutral Highlight when active) */}
                          <td className={`p-2 text-center transition-all ${
                            hasOut 
                              ? "font-bold text-foreground bg-muted/80" 
                              : "text-muted-foreground/30"
                          }`}>
                            {dayMetrics.outQty || "—"}
                          </td>

                          {/* END Column Cell (Anchored Solid Red Tint) */}
                          <td className="p-2 text-center font-bold text-red-600 dark:text-red-400 bg-red-500/[0.08]">
                            {dayMetrics.end}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Month Sum Total Column Cell */}
                    <td className="p-3 text-center text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold text-xs sticky right-0 bg-background/95 backdrop-blur-sm z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
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