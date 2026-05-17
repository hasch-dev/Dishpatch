"use client";

import { useState } from "react";
import ProductActions from "./product-actions";
import { Badge } from "@/components/ui/badge";
import { EyeOff } from "lucide-react";

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [showHidden, setShowHidden] = useState(false);

  // Function to re-fetch or refresh local state
  const refreshData = async () => {
    // You could also just use window.location.reload() for simplicity
    window.location.reload();
  };

  const filteredProducts = showHidden 
    ? products 
    : products.filter(p => !p.is_hidden);

  return (
    <div className="w-full">
      <div className="p-4 border-b border-foreground/5 flex justify-end">
        <button 
          onClick={() => setShowHidden(!showHidden)}
          className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <EyeOff size={12} /> {showHidden ? "Hide Inactive" : "Show Hidden Assets"}
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-foreground/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <th className="p-6">Status</th>
            <th className="p-6">Asset Name</th>
            <th className="p-6">Category</th>
            <th className="p-6 text-right">Price</th>
            <th className="p-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {filteredProducts.map((product) => (
            <tr key={product.id} className={`group hover:bg-foreground/[0.02] transition-colors ${product.is_hidden ? 'opacity-40 grayscale' : ''}`}>
              <td className="p-6">
                <div className="flex items-center gap-2">
                   {/* Stock Status Badge */}
                   <div className={`w-2 h-2 rounded-full ${
                     product.stock_status === 'in_stock' ? 'bg-green-500' : 
                     product.stock_status === 'low_stock' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500'
                   }`} />
                   <span className="text-[9px] font-mono uppercase tracking-tighter opacity-60">
                     {product.stock_status.replace('_', ' ')}
                   </span>
                </div>
              </td>
              <td className="p-6">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-tight">{product.name}</span>
                  <span className="text-[9px] font-mono opacity-40 truncate max-w-[200px]">{product.id}</span>
                </div>
              </td>
              <td className="p-6">
                <span className="text-[10px] font-black uppercase border border-foreground/10 px-2 py-1">
                  {product.category}
                </span>
              </td>
              <td className="p-6 text-right font-mono text-xs">
                ₱ {product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-6 text-right">
                <ProductActions product={product} onUpdate={refreshData} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}