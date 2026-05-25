import React from "react";
import { StockCard } from "./stock-card";

interface ProductStock {
  id: string;
  name: string;
  current_stock: number;
}

export function PublicStockGrid({ items }: { items: ProductStock[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full py-20 border border-border text-center bg-muted/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">
          No inventory data available at this moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border border-border shadow-xl">
      {items.map((item) => (
        <StockCard 
          key={item.id}
          name={item.name}
          currentStock={item.current_stock}
        />
      ))}
    </div>
  );
}