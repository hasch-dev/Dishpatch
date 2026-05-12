"use client";
import { TooltipWrapper } from "@/components/booking/shared/tooltip-wrapper";

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
                  className="w-full bg-transparent text-3xl font-serif outline-none" 
                  value={data.pax[p.toLowerCase()]} 
                  onChange={e => update({ pax: { ...data.pax, [p.toLowerCase()]: e.target.value } })} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Culinary Themes */}
        <div className="lg:col-span-3 space-y-6">
          <TooltipWrapper text="This sets the foundation for the chef's menu proposal.">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-black">Culinary Direction</h4>
          </TooltipWrapper>
          <div className="grid grid-cols-2 gap-3">
            {CULINARY_SETS.map(s => (
              <button 
                key={s.theme} 
                onClick={() => update({ selected_menu_theme: s.theme })} 
                className={`p-5 border text-left transition-all group ${
                  data.selected_menu_theme === s.theme ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-border opacity-40 hover:opacity-100"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{s.theme}</p>
                <p className="text-[9px] italic opacity-50 font-serif leading-tight">{s.sample}</p>
              </button>
            ))}
          </div>
          <button onClick={onOpenCatalog} className="w-full py-6 border border-dashed border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#D4AF37]/5 transition-all mt-4">
            Browse Artisan Catalog ({data.catalog_selections?.length || 0})
          </button>
        </div>
      </div>
    </div>
  );
}