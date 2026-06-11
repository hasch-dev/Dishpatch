"use client";
import { TooltipWrapper } from "@/components/booking/shared/tooltip-wrapper";
import { X } from "lucide-react";

const CULINARY_SETS = [
  { theme: "Modern Filipino", sample: "Deconstructed Sinigang, Adobo Confit" },
  { theme: "Japanese Fusion", sample: "Miso-Glazed Wagyu, Truffle Edamame" },
  { theme: "Mediterranean", sample: "Herb-Crusted Lamb, Saffron Risotto" },
  { theme: "Nordic-Asian", sample: "Cured Salmon, Dill-Soy Reduction" },
  { theme: "Plant-Based Gourmet", sample: "King Oyster Scallops, Beet Carpaccio" },
  { theme: "French Heritage", sample: "Duck Bigarade, Truffle Soufflé" }
];

export default function Step4Culinary({ data, update, onOpenCatalog }: any) {
  const PAX = ["Adults", "Teens", "Seniors", "Children"];

  const removeCatalogItem = (indexToRemove: number) => {
    update({ 
      catalogItems: data.catalogItems.filter((_: any, i: number) => i !== indexToRemove) 
    });
  };

  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-12 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Guest Scale */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-black">Guest Scale</h4>
          <div className="grid grid-cols-2 gap-4">
            {PAX.map(p => (
              <div key={p} className="p-4 border border-border bg-card/5 hover:border-[#D4AF37]/40 transition-all">
                <p className="text-[8px] uppercase tracking-widest opacity-40 mb-1">{p}</p>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-transparent text-3xl font-serif outline-none" 
                  value={data.pax[p.toLowerCase()] || ""} 
                  onChange={e => update({ pax: { ...data.pax, [p.toLowerCase()]: parseInt(e.target.value) || 0 } })} 
                />
              </div>
            ))}
          </div>
          <p className="text-[9px] italic opacity-40 leading-relaxed font-serif">
            * Note: Children are calculated at 50% of the selected service tier base rate.
          </p>
        </div>

        {/* Culinary Themes & Catalog */}
        <div className="lg:col-span-3 space-y-6">
          <TooltipWrapper text="This sets the foundation for the chef's menu proposal.">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-black">Culinary Direction</h4>
          </TooltipWrapper>
          
          <div className="grid grid-cols-2 gap-3">
            {CULINARY_SETS.map(s => (
              <button 
                key={s.theme} 
                onClick={() => update({ direction: s.theme, isCustomFusion: false })} 
                className={`p-5 border text-left transition-all group ${
                  data.direction === s.theme && !data.isCustomFusion ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-border opacity-40 hover:opacity-100"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{s.theme}</p>
                <p className="text-[9px] italic opacity-50 font-serif leading-tight">{s.sample}</p>
              </button>
            ))}
            
            {/* Custom Fusion Option */}
            <button 
              onClick={() => update({ direction: "Custom Fusion", isCustomFusion: true })} 
              className={`col-span-2 p-5 border border-dashed text-center transition-all ${
                data.isCustomFusion ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-border opacity-40 hover:opacity-100"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 text-[#D4AF37]">Bespoke / Custom Fusion</p>
              <p className="text-[9px] italic opacity-50 font-serif leading-tight">Requires a custom culinary design setup (+₱1,500)</p>
            </button>
          </div>

          {/* Artisan Catalog Trigger */}
          <button onClick={onOpenCatalog} className="w-full py-6 border border-dashed border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#D4AF37]/5 transition-all mt-4">
            Browse Artisan Catalog ({data.catalogItems?.length || 0})
          </button>

          {/* Selected Items Tray */}
          {data.catalogItems && data.catalogItems.length > 0 && (
            <div className="mt-6 space-y-2">
              <h5 className="text-[8px] uppercase tracking-widest opacity-40 mb-3">Selected A La Carte Enhancements</h5>
              {data.catalogItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border/50 bg-card/10">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold">{item.name || 'Artisan Dish'}</p>
                    <p className="text-[9px] font-serif italic opacity-50">₱{item.base_price || 0} / guest</p>
                  </div>
                  {item.custom_chef_id && (
                    <span className="text-[8px] tracking-widest uppercase bg-muted/30 px-2 py-1 mr-3 border border-border/50">
                      Guest Artisan
                    </span>
                  )}
                  <button onClick={() => removeCatalogItem(idx)} className="opacity-40 hover:opacity-100 hover:text-red-500 transition-colors p-2">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}