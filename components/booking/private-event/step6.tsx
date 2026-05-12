"use client";
import { TooltipWrapper } from "@/components/booking/shared/tooltip-wrapper";
import { ShieldCheck, Sparkles, Crown, Plus } from "lucide-react";

const TIERS = [
  { id: "Standard", price: "2,000", icon: ShieldCheck, desc: "Classic gourmet courses." },
  { id: "Premium", price: "2,500", icon: Sparkles, desc: "Enhanced artisan selection." },
  { id: "Luxury", price: "4,000", icon: Crown, desc: "Full sensory experience." }
];

const ALLERGIES_LIST = ["Shellfish", "Nuts", "Dairy", "Gluten", "Soy", "Eggs", "Wheat", "Other"];

export default function Step6Notes({ data, update }: any) {
  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-12 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Tier Cards */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Service Level</label>
          <div className="space-y-3">
            {TIERS.map(t => (
              <button 
                key={t.id} 
                onClick={() => update({ service_package: t.id })}
                className={`w-full p-6 border flex items-center gap-6 transition-all ${
                  data.service_package === t.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-border opacity-40 hover:opacity-100"
                }`}
              >
                <t.icon size={24} className={data.service_package === t.id ? "text-[#D4AF37]" : ""} />
                <div className="text-left flex-1">
                  <p className="text-lg font-serif">{t.id}</p>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">{t.desc}</p>
                </div>
                <p className="text-xl font-serif text-[#D4AF37]">₱{t.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dietary & Other */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Dietary Exclusions</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES_LIST.map(a => (
                <button 
                  key={a}
                  onClick={() => {
                    const next = data.allergies?.includes(a) ? data.allergies.filter((x:any) => x !== a) : [...(data.allergies || []), a];
                    update({ allergies: next });
                  }}
                  className={`px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold border transition-all ${
                    data.allergies?.includes(a) ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "border-border opacity-40 hover:opacity-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {data.allergies?.includes("Other") && (
              <input 
                className="w-full bg-transparent border-b border-[#D4AF37]/50 py-3 text-lg font-serif outline-none placeholder:opacity-20 animate-in slide-in-from-top-2"
                placeholder="Please specify other allergies..."
                value={data.custom_allergy}
                onChange={e => update({ custom_allergy: e.target.value })}
              />
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Artisan Notes</label>
            <textarea 
              className="w-full h-32 bg-card/20 border border-border p-5 text-lg font-serif outline-none focus:border-[#D4AF37] italic resize-none"
              placeholder="e.g. A romantic anniversary setup..."
              value={data.notes}
              onChange={e => update({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}