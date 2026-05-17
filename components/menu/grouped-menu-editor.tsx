"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  X, 
  Camera, 
  Search, 
  Utensils, 
  Loader2, 
  Check, 
  Layers, 
  Eraser, 
  PhilippinePeso, 
  TableIcon
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CULINARY_STYLES } from "@/constants/culinary-styles";

interface GroupedMenuEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: () => Promise<void> | void; 
}

const MENU_CLASSIFICATIONS = [
  { value: "main", label: "General / Main" },
  { value: "signature", label: "Signature Collection" },
  { value: "seasonal", label: "Seasonal Release" },
  { value: "event", label: "Special Event" },
  { value: "package", label: "Curated Package" },
];

export default function GroupedMenuEditor({ isOpen, onClose, item, onSave }: GroupedMenuEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFixed, setIsFixed] = useState(!!item?.pricing?.fixed);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const initialState = {
    id: undefined,
    name: "",
    description: "",
    story: "",
    culinary_style: "contemporary",
    classification: "package", 
    linked_item_ids: [] as string[],
    image_url: "",
    pricing: { "2_pax": "", "3_6_pax": "", "7_12_pax": "", "13_plus_pax": "", "fixed": "" }
  };

  const [formData, setFormData] = useState(initialState);
  const supabase = useMemo(() => createClient(), []);
  
  const revenueTable = useMemo(() => {
    const rows = [];
    for (let i = 1; i <= 100; i++) {
      let rate = 0;
      let tierLabel = "";

      if (i <= 2) {
        rate = parseInt(formData.pricing["2_pax"]) || 0;
        tierLabel = "Solo/Duo";
      } else if (i <= 6) {
        rate = parseInt(formData.pricing["3_6_pax"]) || 0;
        tierLabel = "Small Group";
      } else if (i <= 12) {
        rate = parseInt(formData.pricing["7_12_pax"]) || 0;
        tierLabel = "Family";
      } else {
        rate = parseInt(formData.pricing["13_plus_pax"]) || 0;
        tierLabel = "Event";
      }

      rows.push({ pax: i, tier: tierLabel, rate: rate, total: rate * i });
    }
    return rows;
  }, [formData.pricing]);

  useEffect(() => {
    const fetchALaCarte = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from("chef_catalog_items")
        .select("id, name, culinary_style, food_category, image_url")
        .eq("chef_id", user.id)
        .eq("item_type", "a_la_carte");

      if (fetchError) {
        console.error("Error fetching items:", fetchError);
        return;
      }

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
                culinary_style: item.culinary_style || "contemporary",
                classification: item.classification || "package", 
                linked_item_ids: item.linked_item_ids || [],
                image_url: item.image_url || "",
                pricing: item.pricing || initialState.pricing
             });
             setIsFixed(!!item?.pricing?.fixed);
        } else {
             setFormData(initialState);
             setIsFixed(false);
        }
    }
  }, [isOpen, item, supabase]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
  };

  const toggleLinkedItem = (id: string) => {
    const ids = formData.linked_item_ids.includes(id)
      ? formData.linked_item_ids.filter((i: string) => i !== id)
      : [...formData.linked_item_ids, id];
    setFormData({ ...formData, linked_item_ids: ids });
  };

  const handleReset = () => {
    if (confirm("Clear all inputs in this draft? This cannot be undone.")) {
      setFormData(initialState);
      setIsFixed(false);
      setPendingFile(null);
    }
  };

  const handleInternalSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide a name for this assembly.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // DESTRICTURING FIX: pricing is not a column in chef_catalog_items
      const { pricing, ...mainTableData } = formData;

      let finalImageUrl = formData.image_url;
      if (pendingFile) {
        setUploading(true);
        const filePath = `${user.id}/${Date.now()}.${pendingFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('dish-images').upload(filePath, pendingFile);
        if (uploadError) throw uploadError;
        finalImageUrl = supabase.storage.from('dish-images').getPublicUrl(filePath).data.publicUrl;
      }

      const { data: savedMenu, error: menuError } = await supabase
        .from("chef_catalog_items")
        .upsert({
          ...mainTableData,
          chef_id: user.id,
          image_url: finalImageUrl,
          item_type: "grouped_menu",
          price: isFixed ? parseFloat(pricing.fixed) : null,
        }).select().single();

      if (menuError) throw menuError;

      // Sync Pricing Table
      await supabase.from("catalog_item_pricing").delete().eq("item_id", savedMenu.id);
      if (!isFixed) {
        const pricingRows = Object.entries(pricing)
          .filter(([k, v]) => k !== "fixed" && v !== "")
          .map(([pax_range, price]) => ({
            item_id: savedMenu.id,
            pax_range,
            price: parseFloat(price as string),
            is_set_price: true
          }));
        if (pricingRows.length > 0) await supabase.from("catalog_item_pricing").insert(pricingRows);
      }

      toast.success(`${formData.name} archived successfully.`);
      if (onSave) await onSave();
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Critical failure during catalog sync.");
    } finally {
      setIsSaving(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 md:p-12">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-background border border-border/60 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        <header className="p-8 border-b-4 border-primary/20 flex justify-between items-center bg-muted/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="font-serif italic text-3xl leading-none">Menu Assembly</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-black mt-1.5">Multi-Course Orchestration</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-12 w-12 p-0 hover:bg-destructive transition-colors">
            <X size={24} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-20 custom-scrollbar bg-gradient-to-b from-transparent to-muted/5">
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div onClick={handleImageClick} className="aspect-square bg-muted/40 border-2 border-dashed border-border/60 relative group cursor-pointer overflow-hidden flex items-center justify-center hover:border-primary transition-colors">
              {formData.image_url ? (
                <img src={formData.image_url} className="object-cover w-full h-full" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  {uploading ? <Loader2 className="animate-spin text-primary" /> : <Camera size={56} strokeWidth={1} />}
                  <span className="text-[10px] uppercase font-black tracking-widest mt-4">Allocate Assembly Image</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex flex-col justify-center space-y-12">
              <div className="space-y-10">
                <div className="space-y-4 ml-6">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 text-primary">Menu Title</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="rounded-none border-0 border-b-2 border-border/40 bg-transparent px-4 text-4xl font-serif italic h-16 focus-visible:ring-0 focus-visible:border-primary" 
                    placeholder="e.g. The Autumn Harvest"
                  />
                </div>

                <div className="flex flex-col gap-8 ml-6">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Culinary Profile</label>
                    <Select value={formData.culinary_style} onValueChange={(v) => setFormData({...formData, culinary_style: v})}>
                      <SelectTrigger className="rounded-none w-full border-0 border-b-2 border-border/40 bg-transparent px-4 text-xs uppercase tracking-[0.3em] h-14 focus:ring-0">
                        <SelectValue placeholder="CHOOSE" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border/40 bg-background z-[150]">
                        {CULINARY_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value} className="text-[11px] uppercase py-4 border-b border-border/5 last:border-0">{style.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">System Classification</label>
                    <Select value={formData.classification} onValueChange={(v) => setFormData({...formData, classification: v})}>
                      <SelectTrigger className="rounded-none w-full border-0 border-b-2 border-border/40 bg-transparent px-4 text-xs uppercase tracking-[0.3em] h-14 focus:ring-0">
                        <SelectValue placeholder="CHOOSE" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border/40 bg-background z-[150]">
                        {MENU_CLASSIFICATIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-[11px] uppercase py-4 border-b border-border/5 last:border-0">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/20 pt-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="relative group">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-[0.25em] font-black text-muted-foreground">Culinary Narrative</label>
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Provenance & Intent</span>
                </div>
                <div className="relative overflow-hidden border border-border/40 bg-background/40 backdrop-blur-sm transition-all duration-300 group-focus-within:border-primary/50">
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary/60" />
                  <Textarea
                    value={formData.story}
                    onChange={(e) => setFormData({...formData, story: e.target.value})}
                    placeholder="Describe the inspiration or vision for this specific menu..."
                    className="min-h-[320px] resize-none border-0 rounded-none bg-transparent px-8 py-8 text-lg leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-[0.25em] font-black text-muted-foreground">Guest Summary</label>
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Brief Overview</span>
                </div>
                <div className="relative overflow-hidden border border-border/40 bg-background/40 backdrop-blur-sm transition-all duration-300 group-focus-within:border-primary/50">
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary/60" />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="A short summary of what to expect..."
                    className="min-h-[320px] resize-none border-0 rounded-none bg-transparent px-8 py-8 text-lg leading-relaxed shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-border/20 ml-6">
             <div className="flex justify-between items-end mb-10">
                <div>
                  <h3 className="text-[11px] uppercase font-black tracking-[0.3em]">Menu Composition</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">Dishes Selected: {formData.linked_item_ids.length}</p>
                </div>
                <div className="relative w-64 group">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30 group-focus-within:text-primary transition-colors" />
                    <input 
                        className="w-full bg-transparent border-0 border-b-2 border-border/40 h-10 pl-8 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
                        placeholder="Search Catalog..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                    const isSelected = formData.linked_item_ids.includes(item.id);
                    return (
                        <div 
                            key={item.id}
                            onClick={() => toggleLinkedItem(item.id)}
                            className={cn(
                                "p-4 border transition-all flex items-center gap-4 cursor-pointer relative",
                                isSelected ? "border-primary bg-primary/5" : "border-border/40 bg-muted/5 hover:border-primary/40"
                            )}
                        >
                            <div className="h-14 w-14 bg-muted shrink-0 border border-border/20 overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center opacity-20"><Utensils size={18} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <p className="text-[10px] font-black uppercase tracking-tight truncate">{item.name}</p>
                                {/* RENAMED: section_type -> culinary_style */}
                                <p className="text-[8px] uppercase tracking-widest opacity-40 mt-1">{item.culinary_style || "Uncategorized"}</p>
                            </div>
                            <div className={cn("h-4 w-4 border flex items-center justify-center", isSelected ? "bg-primary border-primary" : "border-border/60")}>
                                {isSelected && <Check size={10} className="text-primary-foreground stroke-[4]" />}
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="pt-12 border-t border-border/20 pb-32">
            <div className="flex items-center gap-3 ml-6 mb-10">
              <PhilippinePeso size={18} className="text-primary" />
              <h3 className="text-[11px] uppercase font-black tracking-[0.3em]">Rate Structure & Multi-Pax Projections</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 ml-6">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                  {[
                    { key: "2_pax", label: "Solo / Duo (1-2)" },
                    { key: "3_6_pax", label: "Small Group (3–6)" },
                    { key: "7_12_pax", label: "Family (7–12)" },
                    { key: "13_plus_pax", label: "Event (13+)" }
                  ].map((tier) => (
                    <div key={tier.key} className="space-y-4">
                      <label className="text-[9px] uppercase font-bold opacity-50 tracking-widest">{tier.label}</label>
                      <div className="relative group px-2">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-serif opacity-40">₱</span>
                        <Input 
                          type="number"
                          value={(formData.pricing as any)[tier.key]}
                          onChange={e => setFormData({
                            ...formData, 
                            pricing: { ...formData.pricing, [tier.key]: e.target.value }
                          })}
                          className="rounded-none border-0 border-b-2 border-border/40 bg-transparent pl-6 pr-0 h-12 focus-visible:ring-0 focus-visible:border-primary font-mono text-xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border/40 bg-muted/5 flex flex-col h-[500px]">
                <div className="p-4 border-b border-border/40 bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon size={14} className="opacity-50" />
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Revenue Breakdown (1-100 Pax)</span>
                  </div>  
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-background/80 backdrop-blur-md z-10">
                      <tr className="border-b border-border/40">
                        <th className="p-4 text-[9px] uppercase opacity-40 font-black">Pax</th>
                        <th className="p-4 text-[9px] uppercase opacity-40 font-black">Tier</th>
                        <th className="p-4 text-[9px] uppercase opacity-40 font-black text-right">Total Gross</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                      {revenueTable.map((row) => (
                        <tr key={row.pax} className="hover:bg-primary/5 transition-colors group">
                          <td className="p-4 font-mono text-xs opacity-60">{row.pax}</td>
                          <td className="p-4 text-[10px] font-bold uppercase tracking-tight">{row.tier}</td>
                          <td className="p-4 font-mono text-sm text-right font-bold text-primary origin-right transition-transform group-hover:scale-110">
                            ₱{row.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>

        <footer className="p-8 border-t-4 border-muted flex justify-between items-center bg-muted/20 z-10">
          <Button type="button" variant="ghost" onClick={handleReset} className="text-destructive text-[11px] font-black uppercase tracking-widest px-4">
            <Eraser className="mr-3 h-4 w-4" /> Reset Assembly
          </Button>
          <div className="flex gap-8">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none px-12 uppercase text-[11px] font-black tracking-widest h-14 border-2">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleInternalSave} 
              disabled={isSaving}
              className="rounded-none px-20 bg-primary text-primary-foreground uppercase text-[11px] font-black tracking-[0.3em] h-14 shadow-xl"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Assembly"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}