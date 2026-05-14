"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Camera, Sparkles, Eraser, Loader2, PhilippinePeso, Table as TableIcon } from "lucide-react";
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
import IngredientSelector from "./ingredient-selector";
import { CULINARY_CLASSIFICATIONS } from "@/constants/classifications";
import { createClient } from "@/lib/supabase/client";

interface ALaCarteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: () => Promise<void> | void; 
}

export default function ALaCarteEditor({ isOpen, onClose, item, onSave }: ALaCarteEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW: State to hold the actual file before uploading
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const initialState = {
    id: undefined,
    name: "",
    description: "",
    story: "",
    classification: "main",
    ingredients: [],
    image_url: "",
    pricing: { 
      "2_pax": "", 
      "3_6_pax": "", 
      "7_12_pax": "", 
      "13_plus_pax": ""
    }
  };

  const [formData, setFormData] = useState(initialState);

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
    if (isOpen) {
      if (item) {
        setFormData({
          id: item.id || undefined,
          name: item.name || "",
          description: item.description || "",
          story: item.story || "",
          classification: item.classification || "main",
          ingredients: item.ingredients || [],
          image_url: item.image_url || "",
          pricing: item.pricing || initialState.pricing
        });
      } else {
        setFormData(initialState);
      }
      setPendingFile(null); // Reset pending file on open
    }
  }, [item, isOpen]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPendingFile(file); // Store file for database save
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
  };

  const handleReset = () => {
    if (confirm("Clear all inputs in this draft?")) {
      setFormData(initialState);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInternalSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please provide a name for this dish.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("You must be logged in to save items.");
        return;
      }

      let finalImageUrl = formData.image_url;

      // --- NEW: UPLOAD LOGIC ---
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
        setUploading(false);
      }
      // ------------------------

      const { data: savedItem, error: itemError } = await supabase
        .from('chef_catalog_items')
        .upsert({
          id: formData.id,
          chef_id: user.id, 
          name: formData.name,
          description: formData.description,
          story: formData.story,
          classification: formData.classification,
          ingredients: formData.ingredients,
          image_url: finalImageUrl, // Use the finalized URL
          item_type: 'a_la_carte',
          section_type: 'general'
        })
        .select()
        .single();

      if (itemError) throw itemError;

      const pricingRows = Object.entries(formData.pricing)
        .filter(([_, price]) => price !== "" && price !== null)
        .map(([range, price]) => ({
          item_id: savedItem.id,
          pax_range: range,
          price: parseFloat(price as string),
          is_set_price: false
        }));

      if (pricingRows.length > 0) {
        await supabase.from('catalog_item_pricing').delete().eq('item_id', savedItem.id);
        const { error: pricingError } = await supabase
          .from('catalog_item_pricing')
          .insert(pricingRows);
        if (pricingError) throw pricingError;
      }

      toast.success(`${formData.name} archived successfully.`);
      if (onSave) await onSave();
      onClose(); 
      
    } catch (err: any) {
      console.error(err);
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
        
        {/* HEADER */}
        <header className="p-8 border-b-4 border-primary/20 flex justify-between items-center bg-muted/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-serif italic text-3xl leading-none">A La Carte Matrix</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-black mt-1.5">Consultancy Catalog System</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-12 w-12 p-0 hover:bg-destructive transition-colors">
            <X size={24} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-20 custom-scrollbar bg-gradient-to-b from-transparent to-muted/5">
          
          {/* Identity & Image Allocation */}
          <div className="grid lg:grid-cols-2 gap-16">
            <div onClick={handleImageClick} className="aspect-square bg-muted/40 border-2 border-dashed border-border/60 relative group cursor-pointer overflow-hidden flex items-center justify-center hover:border-primary">
              {formData.image_url ? (
                <img src={formData.image_url} className="object-cover w-full h-full" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  {uploading ? <Loader2 className="animate-spin text-primary" /> : <Camera size={56} strokeWidth={1} />}
                  <span className="text-[10px] uppercase font-black tracking-widest mt-4">Allocate Manifest Image</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex flex-col justify-center space-y-12">
              <div className="space-y-10">
                <div className="space-y-4 ml-6">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Dish Title</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="rounded-none border-0 border-b-2 border-border/40 bg-transparent px-4 text-4xl font-serif italic h-16 focus-visible:ring-0 focus-visible:border-primary" 
                    placeholder="e.g. Kinilaw of Aged Tanigue"
                  />
                </div>

                <div className="space-y-4 ml-6">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Culinary Classification</label>
                  <Select value={formData.classification} onValueChange={(v) => setFormData({...formData, classification: v})}>
                    <SelectTrigger className="rounded-none w-96 border-0 border-b-2 border-border/40 bg-transparent px-4 text-xs uppercase tracking-[0.3em] h-14 focus:ring-0">
                      <SelectValue placeholder="CHOOSE CATEGORY" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border/40 bg-background z-[150]">
                      {CULINARY_CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-[11px] uppercase py-4 border-b border-border/5 last:border-0">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Matrix & Revenue Table */}
          <div className="pt-12 border-t border-border/20">
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

              {/* Revenue breakdown table */}
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
                        <th className="p-4 text-[9px] uppercase opacity-40 font-black">Rate / Head</th>
                        <th className="p-4 text-[9px] uppercase opacity-40 font-black text-right">Total Gross</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                      {revenueTable.map((row) => (
                        <tr key={row.pax} className="hover:bg-primary/5 transition-colors group">
                          <td className="p-4 font-mono text-xs opacity-60">{row.pax}</td>
                          <td className="p-4 text-[10px] font-bold uppercase tracking-tight">{row.tier}</td>
                          <td className="p-4 font-mono text-xs opacity-60">₱{row.rate.toLocaleString()}</td>
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

          {/* Logistics & Ingredients */}
          <div className="grid lg:grid-cols-2 gap-16 pt-12 border-t border-border/20">
            <div className="space-y-8 ml-6">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Menu Component Description</label>
              <Textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="rounded-none bg-muted/10 border-2 border-border/20 min-h-[140px] italic p-6 text-base focus-visible:ring-0 focus-visible:border-primary leading-relaxed resize-none"
                placeholder="A concise sensory profile for the guest..."
              />
            </div>
            <div className="space-y-8 ml-6">
               <IngredientSelector selected={formData.ingredients} onChange={(i: any) => setFormData({...formData, ingredients: i})} />
            </div>
          </div>

          {/* Narrative */}
          <div className="space-y-8 pt-12 border-t border-border/20 pb-32 ml-6">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Culinary Narrative</label>
            <Textarea 
              value={formData.story}
              onChange={e => setFormData({...formData, story: e.target.value})}
              className="rounded-none bg-transparent border-0 border-l-4 border-primary/40 min-h-[350px] italic p-10 text-2xl leading-relaxed focus-visible:ring-0 focus-visible:border-primary"
              placeholder="Detail the provenance and intent..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="p-8 border-t-4 border-muted flex justify-between items-center bg-muted/20 z-10">
          <Button type="button" variant="ghost" onClick={handleReset} className="text-destructive text-[11px] font-black uppercase tracking-widest px-4 hover:bg-destructive/10">
            <Eraser className="mr-3 h-4 w-4" /> Reset Creation Matrix
          </Button>
          <div className="flex gap-8">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none px-12 uppercase text-[11px] font-black tracking-widest h-14 border-2 border-border/60 hover:bg-muted">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleInternalSave} 
              disabled={isSaving}
              className="rounded-none px-20 bg-primary text-primary-foreground uppercase text-[11px] font-black tracking-[0.3em] h-14 hover:bg-primary/90 shadow-xl"
            >
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ARCHIVING...</> : "Save to Catalog"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}