"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, Hash, ArrowUpDown, Filter, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function ChefMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("a_la_carte");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
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

    if (search) {
      result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (categoryFilter !== "all") {
      result = result.filter(i => i.section_type === categoryFilter);
    }

    return result.sort((a, b) => {
      const getMinPrice = (item: any) => {
        if (item.price) return item.price;
        if (item.catalog_item_pricing?.length > 0) {
          return Math.min(...item.catalog_item_pricing.map((p: any) => p.price));
        }
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
  };

  return (
    <div className="min-h-screen bg-background px-6 md:px-12 py-4 md:py-6 max-w-[1600px] mx-auto space-y-12 pb-40">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row p-2 md:p-4 justify-between items-center md:items-center gap-8 border-b-1"> 
        <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight leading-none">Culinary Journey</h1>
        
        <Button 
          onClick={() => setIsPickerOpen(true)}
          className="rounded-2 bg-foreground text-primary-background px-12 h-12 uppercase text-[11px] font-black tracking-[0.2em] shadow-xl hover:bg-primary/90 transition-all"
        >
          <Plus className="mr-3 h-5 w-5 text-background"/> 
            <p className="text-background">
              New Creation
            </p>
        </Button>
      </header>

      {/* Control Bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-y border-border/20 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter} className="w-full lg:w-auto">
          <TabsList className="bg-transparent p-0 gap-12 h-auto">
            <TabsTrigger value="a_la_carte" className="p-0 bg-transparent data-[state=active]:text-primary border-0 text-[11px] uppercase font-black tracking-[0.3em] relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:-bottom-4 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary transition-all">
              A La Carte
            </TabsTrigger>
            <TabsTrigger value="grouped_menu" className="p-0 bg-transparent data-[state=active]:text-primary border-0 text-[11px] uppercase font-black tracking-[0.3em] relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:-bottom-4 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary transition-all">
              Curated Menus
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
            <Input 
              placeholder="Search..." 
              className="pl-12 rounded-none bg-muted/5 border-0 border-b-2 border-border/20 h-12 text-[10px] uppercase tracking-[0.2em] focus-visible:ring-0 focus-visible:border-primary transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-none h-12 px-6 border-border/20 bg-muted/5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-muted/20">
                <ArrowUpDown size={14} className="mr-3 opacity-50" /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-border/20 font-mono text-[10px] p-2">
              <DropdownMenuItem onClick={() => setSortBy("newest")} className="py-3 cursor-pointer">NEWEST FIRST</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alpha")} className="py-3 cursor-pointer">ALPHABETICAL (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price-asc")} className="py-3 cursor-pointer">PRICE: LOW TO HIGH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price-desc")} className="py-3 cursor-pointer">PRICE: HIGH TO LOW</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-none h-12 px-6 border-border/20 bg-muted/5 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-muted/20">
                <Filter size={14} className="mr-3 opacity-50" /> {categoryFilter === "all" ? "Categories" : categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-border/20 font-mono text-[10px] p-2">
              <DropdownMenuItem onClick={() => setCategoryFilter("all")} className="py-3 font-bold cursor-pointer">ALL CATEGORIES</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/20" />
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)} className="uppercase py-3 cursor-pointer">
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Display - STRICTLY 1 OR 2 COLUMNS MAXIMUM */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 opacity-50">
           <Loader2 className="animate-spin mr-4" size={24} />
           <span className="text-[11px] font-black uppercase tracking-[0.4em]">Retrieving Archives...</span>
        </div>
      ) : processedItems.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-border/20">
            <p className="text-xl font-serif italic opacity-40">No items populate this quadrant of the catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {processedItems.map((item) => (
            <CatalogCard 
              key={item.id}
              item={item}
              onEdit={() => {
                setSelectedItem(item);
                setEditorType(item.item_type);
              }}
              onDelete={async () => {
                if(confirm(`Erase "${item.name}" from the catalog permanently?`)) {
                  await supabase.from("chef_catalog_items").delete().eq("id", item.id);
                  fetchMenu();
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Editors */}
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