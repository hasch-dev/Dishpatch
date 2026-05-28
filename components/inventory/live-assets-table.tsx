"use client";

import { Package, AlertCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LiveAssetsTableProps {
  assets: any[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export default function LiveAssetsTable({ 
  assets, filteredCount, currentPage, totalPages, onPageChange, itemsPerPage 
}: LiveAssetsTableProps) {
  
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Depleted", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle };
    if (stock < 10) return { label: "Low Volume", color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle };
    return { label: "Healthy", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 };
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCount);

  return (
    <Card className="rounded-xl border border-border/40 bg-card/40 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Asset Registry Name</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Category Segment</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Current Volume</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Health Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                    <p>No registry assets found matching current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const stock = asset.current_stock ?? 0;
                const status = getStockStatus(stock);
                const StatusIcon = status.icon;

                return (
                  // Removed transition-colors and duration-200 for instant snappy rendering
                  <tr key={asset.id} className="hover:bg-muted/30 group">
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {asset.name}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded text-[11px] uppercase tracking-wider font-semibold border border-border/30">
                        {asset.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-medium">
                      {stock}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {status.label}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border/40 bg-muted/10 px-6 py-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-semibold">{filteredCount > 0 ? startIndex : 0}</span> to <span className="text-foreground font-semibold">{endIndex}</span> of <span className="text-foreground font-semibold">{filteredCount}</span> assets
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-md border-border/50 bg-background/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-semibold px-2">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 w-8 p-0 rounded-md border-border/50 bg-background/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}