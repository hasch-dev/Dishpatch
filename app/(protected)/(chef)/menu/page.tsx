"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, Search, Hash, ArrowUpDown, Filter, Loader2, X, Maximize2, PhilippinePeso, Utensils, ScrollText, Edit3, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
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
import { cn } from "@/lib/utils";

// --- IMPROVED COMPONENT: BRUTALIST DETAIL POPUP ---
const CatalogItemDetailPopup = ({ 
  item, 
  onClose, 
  onEdit, 
  onDelete 
}: { 
  item: any, 
  onClose: () => void,
  onEdit: () => void,
  onDelete: () => void 
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
      {/* Heavy Backdrop for Separation */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
      />
      
      {/* Thick Border & Offset Shadow Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="relative w-full max-w-7xl bg-background border-[8px] border-foreground shadow-[30px_30px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[30px_30px_0px_0px_rgba(255,255,255,0.05)] flex flex-col md:flex-row max-h-[85vh] overflow-hidden"
      >
        {/* Media Sidebar */}
        <div className="w-full md:w-5/12 bg-muted/20 relative border-b-8 md:border-b-0 md:border-r-8 border-foreground flex flex-col">
          <div className="relative flex-1 bg-background">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Utensils size={120} strokeWidth={0.5} />
              </div>
            )}
          </div>
          
          {/* Action Suite */}
          <div className="p-8 space-y-6 bg-foreground text-background">
             <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">System Actions</p>
                <div className="flex flex-col gap-3">
                   <Button 
                    onClick={onEdit}
                    className="cursor-pointer w-full rounded-none bg-background text-foreground h-14 uppercase text-[10px] font-black tracking-[0.2em] hover:bg-primary hover:text-background transition-all border-0"
                   >
                     <Edit3 size={16} className="mr-3" /> Edit Entry
                   </Button>
                   <Button 
                    onClick={onDelete}
                    variant="outline"
                    className="cursor-pointer w-full h-14 rounded-none border-2 border-background/20 bg-transparent text-background hover:bg-foreground uppercase text-[10px] hover:text-background font-black tracking-[0.2em] hover:border-destructive transition-all"
                   >
                     <Trash2 size={16} className="mr-3" /> Purge Record
                   </Button>
                </div>
             </div>
          </div>
        </div>

        {/* Technical Data & Narrative */}
        <div className="flex-1 overflow-x-hidden w-full p-4 md:p-6 space-y-8 custom-scrollbar bg-background">
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-6 w-full">
              <div className="flex items-center w-full justify-between">
                <div className="flex flex-row gap-4 items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] border-2 border-foreground px-4 py-1.5">
                    {item.item_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 italic">
                    // {item.section_type || "No Sector"}
                  </span> 
                </div>
                <button onClick={onClose} className="group p-2">
                  <X size={36} strokeWidth={1} className="opacity-40 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-300" />
                </button>
              </div>
              <h2 className="text-2xl px-4 py-2 md:text-4xl font-serif italic tracking-tighter leading-[0.8]">{item.name}</h2>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-16 border-t-2 border-foreground/10 pt-12">
            <div className="w-full space-y-12">
              {/* Descriptions */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <ScrollText size={18} className="text-primary" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">The Specification</h4>
                </div>
                <div className="space-y-8">
                    <p className="text-xl font-serif italic leading-snug opacity-90 border-l-[6px] border-primary pl-8 py-2">
                      {item.story || "A unique culinary draft without an archived narrative."}
                    </p>
                    {item.description && (
                        <div className="text-[14px] leading-relaxed text-muted-foreground font-medium bg-muted/30 p-8 border-2 border-foreground/5 italic">
                            "{item.description}"
                        </div>
                    )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Hash size={18} className="text-primary" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Component Manifest</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {item.ingredients?.length > 0 ? item.ingredients.map((ing: string, idx: number) => (
                    <span key={idx} className="text-[10px] uppercase font-black tracking-widest border-2 border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                      {ing}
                    </span>
                  )) : <span className="text-[11px] italic opacity-40 font-serif text-lg">Ingredients restricted.</span>}
                </div>
              </section>
            </div>

            {/* Pricing Matrix */}
            <div className="lg:col-span-5 space-y-8 self-start">
              <div className="bg-foreground text-background p-10 space-y-8 border-[4px] border-foreground">
                <div className="flex items-center gap-3">
                  <PhilippinePeso size={20} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Valuation</h4>
                </div>
                
                <div className="space-y-6">
                  {item.catalog_item_pricing?.length > 0 ? (
                    item.catalog_item_pricing.map((price: any) => (
                      <div key={price.id} className="flex justify-between items-end border-b-2 border-background/20 pb-4">
                        <span className="text-[10px] uppercase font-bold opacity-60 tracking-[0.2em]">{price.pax_range.replace(/_/g, ' ')}</span>
                        <span className="font-serif italic text-3xl">₱{price.price.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center opacity-40 italic font-serif text-xl border-2 border-dashed border-background/20 text-background">
                      Pricing Structure TBD
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-2 border-foreground/10 text-[9px] uppercase font-bold tracking-widest leading-loose opacity-40 italic">
                Authorized Personnel Only: Modifications to this record will sync across all active client-facing dossiers immediately.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
              className="pl-14 rounded-none bg-muted/20 border-0 border-b-4 border-foreground/10 h-12 text-[9px] uppercase font-bold tracking-[0.2em] focus-visible:ring-0 focus-visible:border-foreground"
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
          {processedItems.length > 0 ? processedItems.map((item) => (
            <div key={item.id} className="relative group cursor-pointer" onClick={() => setPreviewItem(item)}>
               <div className="absolute inset-0 border-4 border-foreground opacity-0 group-hover:opacity-10 transition-opacity z-10" />
               <CatalogCard item={item} /> 
            </div>
          )) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-foreground/10">
                <p className="text-[12px] uppercase font-black tracking-[0.6em] opacity-20 italic">No records found in this sector.</p>
            </div>
          )}
        </div>
      )}

      {/* The Brutalist Popup Overlay */}
      <AnimatePresence>
        {previewItem && (
          <CatalogItemDetailPopup 
            item={previewItem} 
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