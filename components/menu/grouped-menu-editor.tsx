"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Camera, Sparkles, Plus, Trash2, Search, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import PricingStrategyInput from "./pricing-strategy-input";
import { cn } from "@/lib/utils";

export default function GroupedMenuEditor({ isOpen, onClose, item, onSave }: any) {
  const [isFixed, setIsFixed] = useState(!!item?.pricing?.fixed);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    story: item?.story || "",
    section_type: item?.section_type || "Tasting Menu",
    linked_item_ids: item?.linked_item_ids || [],
    pricing: item?.pricing || { "2": "", "3-6": "", "7-10": "", "10+": "", "fixed": "" }
  });

  const supabase = useMemo(() => createClient(), []);

  // Fetch A La Carte items to choose from
  useEffect(() => {
    const fetchALaCarte = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("chef_catalog_items")
        .select("id, name, section_type")
        .eq("chef_id", user.id)
        .eq("item_type", "a_la_carte");
      setAvailableItems(data || []);
    };
    if (isOpen) fetchALaCarte();
  }, [isOpen, supabase]);

  const toggleLinkedItem = (id: string) => {
    const ids = formData.linked_item_ids.includes(id)
      ? formData.linked_item_ids.filter((i: string) => i !== id)
      : [...formData.linked_item_ids, id];
    setFormData({ ...formData, linked_item_ids: ids });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-background border-l border-border/40 h-full flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
        
        <header className="p-8 border-b border-border/10 flex justify-between items-end bg-card/30">
          <div>
            <h2 className="font-serif italic text-4xl">The Curated Assembly</h2>
            <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40 mt-2">Multi-Course Orchestration</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-none h-12 w-12"><X size={24} /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-16 pb-40 custom-scrollbar">
          {/* Top Section: Hero & Identity */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-10">
                <div className="aspect-video bg-muted border border-border/40 relative group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-40">
                        <Camera size={32} strokeWidth={1} />
                        <span className="text-[8px] uppercase font-black tracking-widest mt-4">Menu Cover Image</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                </div>
                <div className="space-y-4">
                    <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Narrative</label>
                    <Textarea 
                        value={formData.story}
                        onChange={e => setFormData({...formData, story: e.target.value})}
                        className="rounded-none bg-muted/5 border-border/40 min-h-[150px] italic leading-relaxed"
                        placeholder="Describe the journey of this multi-course experience..."
                    />
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Title</label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-3xl font-serif italic h-14" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Type (e.g., Seasonal Tasting)</label>
                    <Input 
                      value={formData.section_type} 
                      onChange={e => setFormData({...formData, section_type: e.target.value})} 
                      className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-[10px] uppercase tracking-[0.4em]" 
                    />
                </div>
                <PricingStrategyInput 
                    pricing={formData.pricing} 
                    setPricing={(p: any) => setFormData({...formData, pricing: p})}
                    isFixed={isFixed}
                    setIsFixed={setIsFixed}
                />
            </div>
          </div>

          {/* COMPOSITION SECTION: Selecting A La Carte Items */}
          <div className="space-y-8 pt-12 border-t border-border/10">
            <div className="flex justify-between items-end">
                <h3 className="font-serif italic text-2xl">Menu Composition</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30" />
                    <input 
                        className="w-full bg-muted/20 border-b border-border/40 h-8 pl-9 text-[10px] uppercase tracking-widest focus:outline-none"
                        placeholder="Search your catalog..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => toggleLinkedItem(item.id)}
                        className={cn(
                            "p-5 border cursor-pointer transition-all flex items-center justify-between group",
                            formData.linked_item_ids.includes(item.id) 
                                ? "border-primary bg-primary/5 shadow-inner" 
                                : "border-border/40 hover:border-primary/40 bg-card/10"
                        )}
                    >
                        <div>
                            <p className="text-xs font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-[8px] uppercase opacity-40 mt-1">{item.section_type}</p>
                        </div>
                        <div className={cn(
                            "h-5 w-5 border flex items-center justify-center transition-colors",
                            formData.linked_item_ids.includes(item.id) ? "bg-primary border-primary" : "border-border/60"
                        )}>
                            {formData.linked_item_ids.includes(item.id) && <Utensils size={10} className="text-white" />}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <footer className="p-8 border-t border-border/10 bg-background flex justify-between items-center shadow-[0_-10px_50px_rgba(0,0,0,0.1)]">
          <p className="text-[10px] font-mono opacity-40 uppercase">
            Items Selected: <span className="text-primary font-bold">{formData.linked_item_ids.length}</span>
          </p>
          <div className="flex gap-6">
            <Button variant="outline" onClick={onClose} className="rounded-none uppercase text-[10px] font-black tracking-widest px-12 h-12">Cancel</Button>
            <Button 
                onClick={() => onSave({ ...formData, item_type: 'grouped_menu' })} 
                className="rounded-none bg-primary text-primary-foreground uppercase text-[10px] font-black tracking-widest px-12 h-12"
            >
              Deploy Menu
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}