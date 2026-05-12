"use client";

import { useState, useEffect, useRef } from "react";
import { X, Camera, Sparkles, Eraser, Loader2, PhilippinePeso } from "lucide-react";
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

interface ALaCarteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (data: any) => void;
}

export default function ALaCarteEditor({ isOpen, onClose, item, onSave }: ALaCarteEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const initialState = {
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
      "13_plus_pax": "", 
      "fixed": "" 
    }
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
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
    }
  }, [item, isOpen]);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
    setUploading(false);
  };

  const handleReset = () => {
    if (confirm("Clear all inputs in this draft?")) {
      setFormData(initialState);
      // Crucial: Clear the file input value so the same image can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInternalSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Attempting to save:", formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 md:p-12">
      <div 
        className="absolute inset-0 bg-background/95 backdrop-blur-xl animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-6xl bg-background border border-border/60 shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER - High Distinction */}
        <header className="p-8 border-b-4 border-primary/20 flex justify-between items-center bg-muted/30 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-serif italic text-3xl leading-none tracking-tight">A La Carte Matrix</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 font-black mt-1.5">Consultancy Catalog System</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-12 w-12 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <X size={24} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-20 custom-scrollbar bg-gradient-to-b from-transparent to-muted/5">
          
          {/* Identity & Image Allocation */}
          <div className="grid lg:grid-cols-2 gap-16">
            <div 
              onClick={handleImageClick}
              className="aspect-square bg-muted/40 border-2 border-dashed border-border/60 relative group cursor-pointer overflow-hidden flex items-center justify-center transition-all hover:border-primary hover:bg-muted/20"
            >
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
                <div className="space-y-4 ml-6"> {/* Added Margin Left */}
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Dish Title</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="rounded-none border-0 border-b-2 border-border/40 bg-transparent px-0 text-4xl font-serif italic h-16 focus-visible:ring-0 focus-visible:border-primary transition-colors" 
                    placeholder="e.g. Kinilaw of Aged Tanigue"
                  />
                </div>

                <div className="space-y-4 ml-6"> {/* Added Margin Left */}
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Culinary Classification</label>
                  <Select 
                    value={formData.classification} 
                    onValueChange={(v) => setFormData({...formData, classification: v})}
                  >
                    <SelectTrigger className="rounded-none border-0 border-b-2 border-border/40 bg-transparent px-0 text-xs uppercase tracking-[0.3em] h-14 focus:ring-0 transition-colors">
                      <SelectValue placeholder="CHOOSE CATEGORY" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border/40 bg-background z-[150]">
                      {CULINARY_CLASSIFICATIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-[11px] uppercase tracking-widest py-4 border-b border-border/5 last:border-0 cursor-pointer">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Philippine Peso Tiered Pricing */}
          <div className="space-y-10 pt-12 border-t border-border/20">
            <div className="flex items-center gap-3 ml-6">
              <PhilippinePeso size={18} className="text-primary" />
              <h3 className="text-[11px] uppercase font-black tracking-[0.3em]">Tiered Rate Structure (PHP per head)</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 ml-6"> {/* Added Margin Left */}
              {[
                { key: "2_pax", label: "Solo / Duo" },
                { key: "3_6_pax", label: "Small Group (3–6)" },
                { key: "7_12_pax", label: "Family (7–12)" },
                { key: "13_plus_pax", label: "Event (13+)" }
              ].map((tier) => (
                <div key={tier.key} className="space-y-4">
                  <label className="text-[9px] uppercase font-bold opacity-50 tracking-widest">{tier.label}</label>
                  <div className="relative group">
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

          {/* Logistics & Ingredients */}
          <div className="grid lg:grid-cols-2 gap-16 pt-12 border-t border-border/20">
            <div className="space-y-8 ml-6"> {/* Added Margin Left */}
              <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">Menu Component Description</label>
              <Textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="rounded-none bg-muted/10 border-2 border-border/20 min-h-[140px] italic p-6 text-base focus-visible:ring-0 focus-visible:border-primary leading-relaxed resize-none"
                placeholder="A concise sensory profile for the guest..."
              />
            </div>
            <div className="space-y-8 ml-6"> {/* Added Margin Left */}
               <IngredientSelector 
                selected={formData.ingredients} 
                onChange={(i: any) => setFormData({...formData, ingredients: i})} 
              />
            </div>
          </div>

          {/* Narrative Section */}
          <div className="space-y-8 pt-12 border-t border-border/20 pb-32 ml-6"> {/* Added Margin Left */}
            <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40">The Culinary Narrative & Lineage</label>
            <Textarea 
              value={formData.story}
              onChange={e => setFormData({...formData, story: e.target.value})}
              className="rounded-none bg-transparent border-0 border-l-4 border-primary/40 min-h-[350px] italic p-10 text-2xl leading-relaxed focus-visible:ring-0 focus-visible:border-primary transition-all"
              placeholder="Detail the provenance, the heat, and your creative intent..."
            />
          </div>
        </div>

        {/* FOOTER - High Distinction */}
        <footer className="p-8 border-t-4 border-muted flex justify-between items-center shrink-0 bg-muted/20 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <Button 
            type="button"
            variant="ghost" 
            onClick={handleReset}
            className="text-destructive text-[11px] font-black uppercase tracking-widest px-4 hover:bg-destructive/10 rounded-none transition-all"
          >
            <Eraser className="mr-3 h-4 w-4" /> Reset Creation Matrix
          </Button>
          <div className="flex gap-8">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose} 
              className="rounded-none px-12 uppercase text-[11px] font-black tracking-widest h-14 border-2 border-border/60 hover:bg-muted transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleInternalSave} 
              className="rounded-none px-20 bg-primary text-primary-foreground uppercase text-[11px] font-black tracking-[0.3em] h-14 hover:bg-primary/90 shadow-xl transition-all"
            >
              Save to Catalog
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}