import { createClient } from "@/lib/supabase/server";
import GalleryRegistryTable from "@/components/admin/gallery-registry-table";
import UploadGalleryDialog from "@/components/admin/upload-gallery-dialog";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("*") 
    .order("sort_order", { ascending: true }); // Switched to sort_order to respect D&D hierarchy

  if (error) {
    console.error("ADMIN GALLERY DB ERROR:", error.message);
  }

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-end justify-between border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Gallery <span className="text-primary italic font-serif">Registry</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Managing {items ? items.length : 0} Visual Assets
            {error && <span className="text-destructive ml-2">— DB Error: Check Console</span>}
          </p>
        </div>
        
        <UploadGalleryDialog />
      </header>

      <div className="bg-card border border-foreground/5 shadow-2xl">
        <GalleryRegistryTable initialItems={items || []} />
      </div>
    </div>
  );
}