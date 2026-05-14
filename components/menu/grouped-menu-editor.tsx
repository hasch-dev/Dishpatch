"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, Camera, Sparkles, Search, Utensils, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import PricingStrategyInput from "./pricing-strategy-input";
import { cn } from "@/lib/utils";

interface GroupedMenuEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: () => Promise<void> | void; 
}

export default function GroupedMenuEditor({ isOpen, onClose, item, onSave }: GroupedMenuEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFixed, setIsFixed] = useState(!!item?.pricing?.fixed);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    id: item?.id || undefined,
    name: item?.name || "",
    description: item?.description || "",
    story: item?.story || "",
    section_type: item?.section_type || "Tasting Menu",
    linked_item_ids: item?.linked_item_ids || [],
    image_url: item?.image_url || "", // Added image_url
    pricing: item?.pricing || { "2_pax": "", "3_6_pax": "", "7_12_pax": "", "13_plus_pax": "", "fixed": "" }
  });

  const supabase = useMemo(() => createClient(), []);

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
    if (isOpen) {
        fetchALaCarte();
        // Reset file state when reopening
        setPendingFile(null); 
        if (item) {
             setFormData(prev => ({...prev, image_url: item.image_url || ""}));
        }
    }
  }, [isOpen, supabase, item]);

  // NEW: Image Handling Functions
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPendingFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
  };

  const toggleLinkedItem = (id: string) => {
    const ids = formData.linked_item_ids.includes(id)
      ? formData.linked_item_ids.filter((i: string) => i !== id)
      : [...formData.linked_item_ids, id];
    setFormData({ ...formData, linked_item_ids: ids });
  };

  const handleInternalSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Menu name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      let finalImageUrl = formData.image_url;

      // --- NEW: UPLOAD LOGIC ---
      if (pendingFile) {
        setUploading(true);
        const fileExt = pendingFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // Saved in same bucket

        const { error: uploadError } = await supabase.storage
          .from('dish-images')
          .upload(filePath, pendingFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('dish-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
        setUploading(false);
      }
      // ------------------------

      const { data: savedMenu, error: menuError } = await supabase
        .from("chef_catalog_items")
        .upsert({
          id: formData.id,
          chef_id: user.id,
          name: formData.name,
          description: formData.description,
          story: formData.story,
          section_type: formData.section_type,
          linked_item_ids: formData.linked_item_ids,
          image_url: finalImageUrl, // Include new URL
          item_type: "grouped_menu",
          price: isFixed ? parseFloat(formData.pricing.fixed) : null,
          classification: "package"
        })
        .select()
        .single();

      if (menuError) throw menuError;

      if (!isFixed) {
        const pricingRows = Object.entries(formData.pricing)
          .filter(([key, val]) => key !== "fixed" && val !== "")
          .map(([pax_range, price]) => ({
            item_id: savedMenu.id,
            pax_range,
            price: parseFloat(price as string),
            is_set_price: true
          }));

        if (pricingRows.length > 0) {
          await supabase.from("catalog_item_pricing").delete().eq("item_id", savedMenu.id);
          const { error: pError } = await supabase.from("catalog_item_pricing").insert(pricingRows);
          if (pError) throw pError;
        }
      } else {
        await supabase.from("catalog_item_pricing").delete().eq("item_id", savedMenu.id);
      }

      toast.success("Curated Assembly deployed.");
      if (onSave) await onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to sync menu with catalog.");
    } finally {
      setIsSaving(false);
      setUploading(false);
    }
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
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-10">
                {/* UPDATED IMAGE UI */}
                <div 
                    onClick={handleImageClick}
                    className="aspect-video bg-muted border border-border/40 relative group cursor-pointer overflow-hidden flex items-center justify-center"
                >
                    {formData.image_url ? (
                        <img src={formData.image_url} className="object-cover w-full h-full z-10" alt="Menu Cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-40 group-hover:opacity-100 transition-opacity">
                            {uploading ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} strokeWidth={1} />}
                            <span className="text-[8px] uppercase font-black tracking-widest mt-4">Menu Cover Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                {/* END UPDATED IMAGE UI */}

                <div className="space-y-4">
                    <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Narrative</label>
                    <Textarea 
                        value={formData.story}
                        onChange={e => setFormData({...formData, story: e.target.value})}
                        className="rounded-none bg-muted/5 border-border/40 min-h-[150px] italic leading-relaxed focus-visible:ring-0 focus-visible:border-primary"
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
                      className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-3xl font-serif italic h-14 focus-visible:ring-0" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Type (e.g., Seasonal Tasting)</label>
                    <Input 
                      value={formData.section_type} 
                      onChange={e => setFormData({...formData, section_type: e.target.value})} 
                      className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-[10px] uppercase tracking-[0.4em] focus-visible:ring-0" 
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

          <div className="space-y-8 pt-12 border-t border-border/10">
            <div className="flex justify-between items-end">
                <h3 className="font-serif italic text-2xl">Menu Composition</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30" />
                    <input 
                        className="w-full bg-muted/20 border-b border-border/40 h-8 pl-9 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary"
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
                onClick={handleInternalSave} 
                disabled={isSaving}
                className="rounded-none bg-primary text-primary-foreground uppercase text-[10px] font-black tracking-widest px-12 h-12 shadow-lg hover:bg-primary/90 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={12} /> : null}
              {formData.id ? "Update Assembly" : "Deploy Menu"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}