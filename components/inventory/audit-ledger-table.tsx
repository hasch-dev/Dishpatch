"use client";

import { History, ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuditLedgerTableProps {
  history: any[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export default function AuditLedgerTable({ 
  history, filteredCount, currentPage, totalPages, onPageChange, itemsPerPage 
}: AuditLedgerTableProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCount);

  return (
    <Card className="rounded-xl border border-border/40 bg-card/40 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Asset Registry</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Flow Direction</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Operation Volume</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Context Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-8 w-8 text-muted-foreground/30" />
                    <p>No operational logs match the current temporal or text filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((log) => {
                const isStockIn = log.type === "IN";
                
                return (
                  // Removed transition animations for instant rendering
                  <tr key={log.id} className="hover:bg-muted/30 group">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {formatDate(log.transaction_date || log.created_at)}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-foreground">
                      {log.products?.name || "Unknown Asset"}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[5px] text-[10px] uppercase tracking-wider font-bold border ${
                        isStockIn 
                          ? "bg-green-500/10 text-green-600 border-green-500/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {isStockIn ? <ArrowDownRight className="h-3 w-3" strokeWidth={3} /> : <ArrowUpRight className="h-3 w-3" strokeWidth={3} />}
                        {isStockIn ? "Stock In" : "Stock Out"}
                      </div>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-mono font-bold ${isStockIn ? "text-green-600 dark:text-green-500" : "text-destructive"}`}>
                      {isStockIn ? "+" : "-"}{log.quantity}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground text-xs truncate max-w-[200px]" title={log.notes}>
                      {log.notes || <span className="italic opacity-50">No context provided</span>}
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
          Showing <span className="text-foreground font-semibold">{filteredCount > 0 ? startIndex : 0}</span> to <span className="text-foreground font-semibold">{endIndex}</span> of <span className="text-foreground font-semibold">{filteredCount}</span> operations
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