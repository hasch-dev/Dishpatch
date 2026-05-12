"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function ItemEditorOverlay({ isOpen, onClose, item, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "", price: "", description: "", story: "", 
    item_type: "a_la_carte", section_type: "General", ingredients: []
  });

  useEffect(() => {
    if (item) setFormData(item);
    else setFormData({ name: "", price: "", description: "", story: "", item_type: "a_la_carte", section_type: "General", ingredients: [] });
  }, [item, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = { ...formData, chef_id: user?.id };
    
    const { error } = item 
      ? await supabase.from("chef_catalog_items").update(payload).eq("id", item.id)
      : await supabase.from("chef_catalog_items").insert([payload]);

    if (!error) {
      onSave();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Content Drawer */}
      <div className="relative w-full max-w-2xl bg-background border-l border-border/40 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="p-8 border-b border-border/10 flex items-center justify-between">
          <div>
            <h2 className="font-serif italic text-3xl">{item ? 'Edit Creation' : 'New Creation'}</h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">Catalog Entry No. {item?.id?.slice(0,8) || 'NEW'}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-none hover:bg-muted"><X size={20} /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section: Basic Info */}
          <section className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Dish Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:border-primary" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Price (PHP)</label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:border-primary" 
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Short Description</label>
                <Textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="rounded-none bg-muted/20 border-border/40 min-h-[80px] italic text-sm"
                    placeholder="Describe the flavor profile..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50 flex items-center gap-2">
                    <Sparkles size={10} className="text-primary" /> The Story
                </label>
                <Textarea 
                    value={formData.story}
                    onChange={e => setFormData({...formData, story: e.target.value})}
                    className="rounded-none bg-muted/10 border-border/40 min-h-[120px] text-sm leading-relaxed"
                    placeholder="What inspired this dish? Where did the ingredients come from?"
                />
            </div>
          </section>

          {/* Section: Classification */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/10">
            <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Catalog Category</label>
                <select 
                    className="w-full bg-transparent border-b border-border/40 text-xs py-2 uppercase tracking-widest outline-none"
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value})}
                >
                    <option value="a_la_carte">A La Carte Item</option>
                    <option value="grouped_menu">Grouped / Tasting Menu</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Section (e.g. Entrees)</label>
                <Input 
                    value={formData.section_type}
                    onChange={e => setFormData({...formData, section_type: e.target.value})}
                    className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-xs uppercase tracking-widest"
                />
            </div>
          </div>
        </div>

        <footer className="p-8 border-t border-border/10 bg-muted/5 flex items-center justify-between">
          <Button variant="ghost" className="text-destructive text-[10px] uppercase font-black tracking-widest hover:bg-destructive/5 rounded-none">
            <Trash2 className="mr-2 h-4 w-4" /> Discard
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="rounded-none text-[10px] uppercase font-black tracking-widest px-8">Cancel</Button>
            <Button 
                onClick={handleSave} 
                disabled={loading}
                className="rounded-none bg-primary text-primary-foreground text-[10px] uppercase font-black tracking-widest px-8"
            >
              {loading ? "Syncing..." : "Save Manifest"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}