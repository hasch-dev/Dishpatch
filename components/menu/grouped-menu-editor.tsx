"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { X, Camera, Search, Utensils, Loader2, Check, ChevronDown } from "lucide-react";
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
    classification: item?.classification || "package", // NEW: Added Classification state
    linked_item_ids: item?.linked_item_ids || [],
    image_url: item?.image_url || "",
    pricing: item?.pricing || { "2_pax": "", "3_6_pax": "", "7_12_pax": "", "13_plus_pax": "", "fixed": "" }
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchALaCarte = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("chef_catalog_items")
        .select("id, name, section_type, image_url")
        .eq("chef_id", user.id)
        .eq("item_type", "a_la_carte");
      setAvailableItems(data || []);
    };

    if (isOpen) {
        fetchALaCarte();
        setPendingFile(null); 
        if (item) {
             setFormData({
                id: item.id,
                name: item.name || "",
                description: item.description || "",
                story: item.story || "",
                section_type: item.section_type || "Tasting Menu",
                classification: item.classification || "package", // NEW: Ensure it updates on open
                linked_item_ids: item.linked_item_ids || [],
                image_url: item.image_url || "",
                pricing: item.pricing || { "2_pax": "", "3_6_pax": "", "7_12_pax": "", "13_plus_pax": "", "fixed": "" }
             });
             setIsFixed(!!item?.pricing?.fixed);
        }
    }
  }, [isOpen, supabase, item]);

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

      if (pendingFile) {
        setUploading(true);
        const fileExt = pendingFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; 

        const { error: uploadError } = await supabase.storage
          .from('dish-images')
          .upload(filePath, pendingFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('dish-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      }

      const { data: savedMenu, error: menuError } = await supabase
        .from("chef_catalog_items")
        .upsert({
          id: formData.id,
          chef_id: user.id,
          name: formData.name,
          description: formData.description,
          story: formData.story,
          section_type: formData.section_type,
          classification: formData.classification, // NEW: Saves dynamic classification instead of hardcoded 'package'
          linked_item_ids: formData.linked_item_ids,
          image_url: finalImageUrl,
          item_type: "grouped_menu",
          price: isFixed ? parseFloat(formData.pricing.fixed) : null,
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
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-background border-l border-border/40 h-full flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
        
        {/* HEADER */}
        <header className="px-8 py-6 border-b border-border/10 flex justify-between items-center bg-card/30 sticky top-0 z-10">
          <div>
            <h2 className="font-serif italic text-3xl">Menu Assembly</h2>
            <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40 mt-1">Multi-Course Orchestration</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X size={18} />
          </Button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO IMAGE SECTION */}
          <div 
              onClick={handleImageClick}
              className="w-full aspect-video bg-muted/30 border-b border-border/20 relative group cursor-pointer overflow-hidden flex items-center justify-center"
          >
              {formData.image_url ? (
                  <img src={formData.image_url} className="object-cover w-full h-full z-10 transition-transform duration-700 group-hover:scale-105" alt="Menu Cover" />
              ) : (
                  <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                      {uploading ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} strokeWidth={1} />}
                      <span className="text-[9px] uppercase font-black tracking-widest mt-4">Upload Cover Image</span>
                  </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                  {formData.image_url && <span className="text-white text-[10px] uppercase font-black tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Image</span>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="p-8 space-y-12">
            {/* CORE DETAILS */}
            <div className="space-y-8">
              <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Menu Title</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g., The Autumn Harvest"
                    className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-3xl font-serif italic h-14 focus-visible:ring-0 placeholder:opacity-30" 
                  />
              </div>

              {/* NEW: Grid for Category and Classification side-by-side */}
              <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Descriptor Type</label>
                      <Input 
                        value={formData.section_type} 
                        onChange={e => setFormData({...formData, section_type: e.target.value})} 
                        placeholder="e.g., Tasting Menu"
                        className="rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-sm focus-visible:ring-0 placeholder:opacity-30" 
                      />
                  </div>
                  <div className="space-y-2 relative">
                      <label className="text-[9px] uppercase font-black tracking-widest opacity-50">System Filter</label>
                      <select 
                          value={formData.classification}
                          onChange={e => setFormData({...formData, classification: e.target.value})}
                          className="w-full rounded-none border-0 border-b border-border/40 bg-transparent px-0 text-sm h-10 focus-visible:ring-0 focus:outline-none appearance-none cursor-pointer"
                      >
                          <option value="main" className="bg-background text-foreground">General / Main</option>
                          <option value="signature" className="bg-background text-foreground">Signature Collection</option>
                          <option value="seasonal" className="bg-background text-foreground">Seasonal Release</option>
                          <option value="event" className="bg-background text-foreground">Special Event</option>
                          <option value="package" className="bg-background text-foreground">Curated Package</option>
                      </select>
                      <ChevronDown className="absolute right-0 bottom-3 opacity-30 pointer-events-none" size={14} />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Brief Description</label>
                  <Textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="rounded-none bg-transparent border-0 border-b border-border/40 min-h-[60px] resize-none px-0 focus-visible:ring-0 placeholder:opacity-30"
                      placeholder="A short summary of what to expect..."
                  />
              </div>

              <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest opacity-50">The Narrative (Story)</label>
                  <Textarea 
                      value={formData.story}
                      onChange={e => setFormData({...formData, story: e.target.value})}
                      className="rounded-none bg-muted/10 border border-border/40 min-h-[120px] p-4 italic text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary placeholder:not-italic"
                      placeholder="Describe the inspiration, journey, or the chef's vision for this specific menu..."
                  />
              </div>
            </div>

            <div className="h-px w-full bg-border/20" />

            {/* PRICING */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Utensils size={14} className="opacity-50" />
                <h3 className="text-[10px] uppercase font-black tracking-widest">Menu Valuation</h3>
              </div>
              <PricingStrategyInput 
                  pricing={formData.pricing} 
                  setPricing={(p: any) => setFormData({...formData, pricing: p})}
                  isFixed={isFixed}
                  setIsFixed={setIsFixed}
              />
            </div>

            <div className="h-px w-full bg-border/20" />

            {/* COMPOSITION (A LA CARTE SELECTOR) */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif italic text-2xl">Menu Composition</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">Select A La Carte Items</p>
                  </div>
                  <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 opacity-30" />
                      <input 
                          className="w-full bg-muted/20 border-b border-border/40 h-8 pl-8 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
                          placeholder="Search items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                      const isSelected = formData.linked_item_ids.includes(item.id);
                      return (
                          <div 
                              key={item.id}
                              onClick={() => toggleLinkedItem(item.id)}
                              className={cn(
                                  "p-3 border cursor-pointer transition-all flex items-center gap-3 group relative overflow-hidden",
                                  isSelected 
                                      ? "border-primary bg-primary/5" 
                                      : "border-border/40 hover:border-primary/40 bg-card/10"
                              )}
                          >
                              <div className="h-10 w-10 bg-muted shrink-0 flex items-center justify-center overflow-hidden border border-border/20">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Utensils size={12} className="opacity-20" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0 pr-6">
                                  <p className="text-xs font-bold uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                    {item.name}
                                  </p>
                                  <p className="text-[8px] uppercase opacity-40 mt-0.5 truncate">
                                    {item.section_type || "Uncategorized"}
                                  </p>
                              </div>

                              <div className={cn(
                                  "absolute right-3 h-4 w-4 border flex items-center justify-center transition-all",
                                  isSelected ? "bg-primary border-primary scale-100" : "border-border/60 scale-90 group-hover:scale-100"
                              )}>
                                  {isSelected && <Check size={10} className="text-primary-foreground" />}
                              </div>
                          </div>
                      );
                  })}
                  
                  {availableItems.length === 0 && (
                    <div className="col-span-full py-8 text-center border border-dashed border-border/40 text-muted-foreground">
                      <p className="text-xs uppercase tracking-widest font-bold">No A La Carte Items Found</p>
                      <p className="text-[10px] mt-2 opacity-60">Create individual dishes first to compose a menu.</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="px-8 py-5 border-t border-border/10 bg-background flex justify-between items-center shrink-0">
          <p className="text-[10px] font-mono opacity-40 uppercase">
            Dishes Included: <span className="text-primary font-bold">{formData.linked_item_ids.length}</span>
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onClose} className="rounded-none uppercase text-[10px] font-black tracking-widest px-6 h-10">
              Cancel
            </Button>
            <Button 
                onClick={handleInternalSave} 
                disabled={isSaving}
                className="rounded-none bg-primary text-primary-foreground uppercase text-[10px] font-black tracking-widest px-8 h-10 shadow-lg hover:bg-primary/90 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={12} /> : null}
              {formData.id ? "Update Menu" : "Save Menu"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}