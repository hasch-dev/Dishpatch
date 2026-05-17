"use client";

import { useState } from "react";
import { Trash2, Edit3, ExternalLink, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const supabase = createClient();

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-foreground/10">
            <th className="p-4 text-[10px] uppercase tracking-widest font-black">Asset</th>
            <th className="p-4 text-[10px] uppercase tracking-widest font-black">Category</th>
            <th className="p-4 text-[10px] uppercase tracking-widest font-black">Price</th>
            <th className="p-4 text-[10px] uppercase tracking-widest font-black">Status</th>
            <th className="p-4 text-[10px] uppercase tracking-widest font-black text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-primary/5 transition-colors group">
              <td className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted overflow-hidden border border-foreground/10">
                    <img src={product.image_url} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{product.name}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{product.id.slice(0, 8)}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-[10px] font-bold uppercase opacity-60">{product.category}</td>
              <td className="p-4 font-serif italic">${product.price}</td>
              <td className="p-4">
                <span className={`text-[9px] px-2 py-1 uppercase font-black ${product.stock_status === 'In Stock' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {product.stock_status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:text-primary transition-colors"><Edit3 size={16} /></button>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}