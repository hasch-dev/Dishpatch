"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, ArrowUpDown, Filter, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom Components
import CreationTypePicker from "@/components/menu/creation-type-picker";
import ALaCarteEditor from "@/components/menu/a-la-carte-editor";
import GroupedMenuEditor from "@/components/menu/grouped-menu-editor";
import CatalogCard from "@/components/menu/catalog-card";
import CatalogItemDetailPopup from "@/components/menu/catalog-item-detail-popup"; // <-- NEW IMPORT
import { cn } from "@/lib/utils";

export default function ChefMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("a_la_carte");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [previewItem, setPreviewItem] = useState<any>(null); 
  const [editorType, setEditorType] = useState<'a_la_carte' | 'grouped_menu' | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchMenu = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("chef_catalog_items")
      .select("*, catalog_item_pricing(*)")
      .eq("chef_id", user.id);
    
    setItems(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchMenu(); }, [supabase]);

  const processedItems = useMemo(() => {
    let result = items.filter(item => item.item_type === filter);
    if (search) result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") result = result.filter(i => i.section_type === categoryFilter);

    return result.sort((a, b) => {
      const getMinPrice = (item: any) => {
        if (item.price) return item.price;
        if (item.catalog_item_pricing?.length > 0) return Math.min(...item.catalog_item_pricing.map((p: any) => p.price));
        return 0;
      };
      if (sortBy === "price-asc") return getMinPrice(a) - getMinPrice(b);
      if (sortBy === "price-desc") return getMinPrice(b) - getMinPrice(a);
      if (sortBy === "alpha") return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, filter, search, sortBy, categoryFilter]);

  const categories = useMemo(() => {
    const sets = new Set(items.filter(i => i.item_type === filter).map(i => i.section_type));
    return Array.from(sets).filter(Boolean);
  }, [items, filter]);

  const closeAll = () => {
      setIsPickerOpen(false);
      setEditorType(null);
      setSelectedItem(null);
      setPreviewItem(null);
  };

  const handleEditInit = (item: any) => {
    setSelectedItem(item);
    setEditorType(item.item_type);
    setPreviewItem(null);
  };

  const handleDeleteItem = async (item: any) => {
    if(confirm(`WARNING: This will permanently erase "${item.name.toUpperCase()}" from the registry. Proceed?`)) {
        const { error } = await supabase.from("chef_catalog_items").delete().eq("id", item.id);
        if (!error) {
            setPreviewItem(null);
            fetchMenu();
        }
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 md:px-12 py-4 md:py-6 max-w-[1600px] mx-auto space-y-12 pb-12">
      
      <header className="flex flex-col md:flex-row p-2 md:p-4 justify-between items-center gap-8 border-b-2 border-foreground/5"> 
        <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-none">Menu Archive</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.8em] opacity-20">Menu Registry</p>
        </div>
        
        <Button 
          onClick={() => setIsPickerOpen(true)}
          className="rounded-none bg-foreground text-background px-12 h-12 uppercase text-[12px] font-black tracking-[0.3em] hover:bg-primary transition-colors"
        >
          <Plus className="mr-3 h-5 w-5"/> New Record
        </Button>
      </header>

      {/* Control Bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-y-2 border-foreground/10 py-4 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v); setCategoryFilter("all"); }} className="w-full lg:w-auto">
          <TabsList className="bg-transparent p-0 gap-8 h-auto">
            {["a_la_carte", "grouped_menu"].map((val) => (
                <TabsTrigger key={val} value={val} className="p-0 bg-transparent data-[state=active]:text-foreground border-0 text-[10px] uppercase font-black tracking-[0.4em] relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:-bottom-2 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[4px] data-[state=active]:after:bg-foreground opacity-30 data-[state=active]:opacity-100 transition-all">
                    {val.replace('_', ' ')}
                </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-20" />
            <Input 
              placeholder="Search registry..." 
              className="pl-14 rounded-none bg-muted/20 border-0 border-b-4 border-foreground/10 h-12 text-[4px] uppercase font-bold tracking-[0.2em] focus-visible:ring-0 focus-visible:border-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
             {/* Category Filter */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-none border-2 border-foreground/10 text-[10px] uppercase font-black tracking-widest px-6 hover:bg-foreground hover:text-background transition-all">
                    <Filter className="mr-2 h-3.5 w-3.5" /> {categoryFilter === 'all' ? 'All Sectors' : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-foreground p-0 min-w-[200px]">
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")} className="text-[10px] uppercase font-bold tracking-widest p-4 cursor-pointer focus:bg-foreground focus:text-background rounded-none">All Sectors</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-foreground/10 m-0" />
                  {categories.map((cat: any) => (
                    <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)} className="text-[10px] uppercase font-bold tracking-widest p-4 cursor-pointer focus:bg-foreground focus:text-background rounded-none">{cat}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Matrix */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-none border-2 border-foreground/10 text-[10px] uppercase font-black tracking-widest px-6 hover:bg-foreground hover:text-background transition-all">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none border-2 border-foreground p-0 min-w-[200px]">
                  {[
                    { label: "Newest First", value: "newest" },
                    { label: "Alphabetical", value: "alpha" },
                    { label: "Price: Low to High", value: "price-asc" },
                    { label: "Price: High to Low", value: "price-desc" }
                  ].map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)} className={cn("text-[10px] uppercase font-bold tracking-widest p-4 cursor-pointer focus:bg-foreground focus:text-background rounded-none", sortBy === opt.value && "bg-muted")}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
          <Loader2 className="animate-spin" size={40} strokeWidth={1} />
          <span className="text-[12px] font-black uppercase tracking-[0.5em]">Scanning...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
          {processedItems.length > 0 ? (
            processedItems.map((item) => (
              <div 
                key={item.id} 
                className="relative group cursor-pointer" 
                onClick={() => setPreviewItem(item)}
              >
                {/* Overlay border - pointer-events-none ensures buttons remain clickable */}
                <div className="absolute inset-0 border-4 border-foreground opacity-0 group-hover:opacity-10 transition-opacity z-10 pointer-events-none" />
                
                <CatalogCard 
                  item={item} 
                  onEdit={() => handleEditInit(item)}
                  onDelete={() => handleDeleteItem(item)}
                /> 
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-foreground/10">
                <p className="text-[12px] uppercase font-black tracking-[0.6em] opacity-20 italic">
                  No records found in this sector.
                </p>
            </div>
          )}
        </div>
      )}

      {/* The Brutalist Popup Overlay */}
      <AnimatePresence>
        {previewItem && (
          <CatalogItemDetailPopup 
            item={previewItem} 
            registryItems={items}
            onClose={() => setPreviewItem(null)} 
            onEdit={() => handleEditInit(previewItem)}
            onDelete={() => handleDeleteItem(previewItem)}
          />
        )}
      </AnimatePresence>

      <CreationTypePicker 
        isOpen={isPickerOpen} 
        onClose={closeAll} 
        onSelect={(type) => { setIsPickerOpen(false); setEditorType(type as any); }} 
      />
      
      {editorType === 'a_la_carte' && (
        <ALaCarteEditor isOpen={true} onClose={closeAll} item={selectedItem} onSave={fetchMenu} />
      )}
      
      {editorType === 'grouped_menu' && (
        <GroupedMenuEditor isOpen={true} onClose={closeAll} item={selectedItem} onSave={fetchMenu} />
      )}
    </div>
  );
}