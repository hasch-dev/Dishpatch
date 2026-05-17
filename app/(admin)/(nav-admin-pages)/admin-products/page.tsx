import { createClient } from "@/lib/supabase/server";
import ProductTable from "@/components/admin/product-table";
import AddProductDialog from "@/components/admin/add-product-dialog";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-end justify-between border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Product <span className="text-primary italic font-serif">Registry</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Managing {products?.length || 0} Total Assets
          </p>
        </div>
        
        {/* The Upload Component */}
        <AddProductDialog />
      </header>

      <div className="bg-card border border-foreground/5 shadow-2xl">
        <ProductTable initialProducts={products || []} />
      </div>
    </div>
  );
}