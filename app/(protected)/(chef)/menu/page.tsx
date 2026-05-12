"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, UtensilsCrossed, Trash2, 
  Layers, Hash, Sparkles, LayoutGrid 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Custom Components
import CreationTypePicker from "@/components/menu/creation-type-picker";
import ALaCarteEditor from "@/components/menu/a-la-carte-editor";
import GroupedMenuEditor from "@/components/menu/grouped-menu-editor";
import CatalogCard from "@/components/menu/catalog-card"; // Using the refined card we built

export default function ChefMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("a_la_carte");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editorType, setEditorType] = useState<'a_la_carte' | 'grouped_menu' | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  // --- Logic ---

  const handleBulkDelete = async () => {
    // 1. Safety check to ensure records aren't purged accidentally
    const isConfirmed = confirm(
      `Warning: You are about to permanently purge ${selectedIds.length} record(s) from the Manifesto. This action cannot be undone. Proceed?`
    );
    
    if (!isConfirmed) return;

    try {
      // 2. Execute the bulk delete on the chef_catalog_items table
      const { error } = await supabase
        .from("chef_catalog_items")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      // 3. Post-purge cleanup
      setSelectedIds([]); // Reset selection state
      await fetchMenu();   // Refresh the UI to reflect changes
      
    } catch (error: any) {
      console.error("Critical Failure during bulk purge:", error.message);
      alert("Failed to delete items. Please check system logs.");
    }
  };

  const fetchMenu = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("chef_catalog_items")
      .select("*")
      .eq("chef_id", user.id)
      .order("created_at", { ascending: false });
    
    setItems(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchMenu(); }, [supabase]);

  const handleSave = async (payload: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const finalPayload = { 
        ...payload, 
        chef_id: user?.id,
        item_type: editorType || payload.item_type 
    };

    const { error } = selectedItem 
        ? await supabase.from("chef_catalog_items").update(finalPayload).eq("id", selectedItem.id)
        : await supabase.from("chef_catalog_items").insert([finalPayload]);

    if (!error) {
        fetchMenu();
        closeAll();
    }
  };

  const closeAll = () => {
      setIsPickerOpen(false);
      setEditorType(null);
      setSelectedItem(null);
  };

  const filteredItems = items.filter(item => 
    item.item_type === filter && 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Sub-sections for UI ---

  const StatsHeader = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/20 border border-border/20 mb-12">
      <div className="bg-background p-6 space-y-2">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Catalog Volume</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif italic">{items.length}</span>
          <span className="text-[10px] opacity-30 uppercase font-bold">Total Entries</span>
        </div>
      </div>
      <div className="bg-background p-6 space-y-2 border-l border-border/10">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Composition Ratio</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-serif italic">
            {items.filter(i => i.item_type === 'grouped_menu').length}
          </span>
          <span className="text-[10px] opacity-30 uppercase font-bold">Active Menus</span>
        </div>
      </div>
      <div className="bg-background p-6 space-y-2 border-l border-border/10">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Manifesto Status</p>
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={14} />
          <span className="text-[10px] uppercase font-black tracking-widest italic">Live & Synchronized</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8 max-w-7xl mx-auto space-y-12 pb-40">
      
      {/* 1. Page Title & Action */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 opacity-30">
            <Hash size={12} />
            <p className="text-[9px] font-bold uppercase tracking-[0.5em]">System_v.16.2</p>
          </div>
          <h1 className="text-7xl font-serif italic tracking-tight leading-none">The Manifesto</h1>
          <p className="max-w-md text-xs text-muted-foreground leading-relaxed italic opacity-60">
            Your centralized repository for culinary components and curated experiences. 
            Manage individual items or assemble them into complex sequences.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsPickerOpen(true)}
          className="rounded-none bg-primary text-primary-foreground px-10 h-14 uppercase text-[10px] font-black tracking-[0.2em] hover:tracking-[0.3em] transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> New Creation
        </Button>
      </header>

      {/* 2. Stats Dashboard */}
      <StatsHeader />

      {/* 3. Controls & Filter */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-y border-border/10 py-4 flex flex-col md:flex-row gap-8 items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
          <TabsList className="bg-muted/10 p-1 rounded-none border border-border/20">
            <TabsTrigger 
              value="a_la_carte" 
              className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] uppercase font-black tracking-widest px-8 h-8"
            >
              <LayoutGrid size={12} className="mr-2" /> A La Carte
            </TabsTrigger>
            <TabsTrigger 
              value="grouped_menu" 
              className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px] uppercase font-black tracking-widest px-8 h-8"
            >
              <Layers size={12} className="mr-2" /> Curated Menus
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 opacity-20 group-focus-within:opacity-100 transition-opacity" />
          <Input 
            placeholder="FILTER BY NOMENCLATURE..." 
            className="pl-10 rounded-none bg-muted/5 border-border/40 h-12 text-[10px] uppercase tracking-widest focus-visible:ring-0 focus-visible:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 4. The Grid Content */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10 border border-border/10">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="bg-background">
                <CatalogCard 
                    item={item} 
                    index={index} 
                    onEdit={() => {
                        setSelectedItem(item);
                        setEditorType(item.item_type);
                    }}
                    onDelete={async () => {
                        if(confirm("Confirm deletion of this record?")) {
                            await supabase.from("chef_catalog_items").delete().eq("id", item.id);
                            fetchMenu();
                        }
                    }}
                />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-40 flex flex-col items-center justify-center border border-dashed border-border/40 space-y-6">
          <UtensilsCrossed size={40} strokeWidth={1} className="opacity-10" />
          <div className="text-center space-y-2">
            <h3 className="font-serif italic text-2xl opacity-40">No entries found in this section</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-30">Initiate a new creation to populate the manifesto</p>
          </div>
          <Button variant="outline" onClick={() => setIsPickerOpen(true)} className="rounded-none text-[10px] uppercase font-bold tracking-widest">
            Begin Creation
          </Button>
        </div>
      )}

      {/* 5. Modals & Overlays */}
      <CreationTypePicker 
          isOpen={isPickerOpen} 
          onClose={() => setIsPickerOpen(false)} 
          onSelect={(type) => {
              setEditorType(type);
              setIsPickerOpen(false);
          }}
      />

      <ALaCarteEditor 
          isOpen={editorType === 'a_la_carte'} 
          onClose={closeAll} 
          item={selectedItem}
          onSave={handleSave} 
      />

      <GroupedMenuEditor 
          isOpen={editorType === 'grouped_menu'} 
          onClose={closeAll} 
          item={selectedItem}
          onSave={handleSave} 
      />

      {/* 6. Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-10 py-5 flex items-center gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 animate-in slide-in-from-bottom-10">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedIds.length} Entries Selected</span>
                <span className="text-[8px] opacity-60 uppercase font-bold">Bulk Action Mode Active</span>
            </div>
            <div className="h-8 w-px bg-primary-foreground/20" />
            <button onClick={handleBulkDelete} className="text-[10px] font-black uppercase tracking-widest hover:text-destructive-foreground transition-colors flex items-center gap-2 group">
                <Trash2 size={14} className="group-hover:animate-bounce" /> Purge Records
            </button>
            <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Dismiss</button>
        </div>
      )}
    </div>
  );
}