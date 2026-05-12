"use client";
import { Award, Target, Sparkles, Crown } from "lucide-react";

export default function Step7Summary({ data }: any) {
  // Database-aligned pax calculation
  const totalPax = Object.values(data.pax || {}).reduce(
    (a: any, b: any) => parseInt(a || 0) + parseInt(b || 0), 
    0
  );

  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000 py-4">
      
      {/* Header - Compact for viewport locking */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-3 px-4 py-1 border border-[#D4AF37]/30 rounded-full mb-2">
          <Sparkles size={10} className="text-[#D4AF37]" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-[#D4AF37]">Final Review</span>
          <Sparkles size={10} className="text-[#D4AF37]" />
        </div>
        <h3 className="text-5xl font-serif italic text-primary tracking-tight">The Inquiry Manifesto</h3>
      </div>

      {/* Hero Badge: Highly Noticeable Service Tier */}
      <div className="relative overflow-hidden bg-background border-2 border-[#D4AF37] p-1 rounded-sm shadow-[0_0_40px_-15px_rgba(212,175,55,0.3)]">
        <div className="bg-[#D4AF37]/10 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center text-black shadow-lg">
              <Crown size={28} strokeWidth={1.5} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-[#D4AF37] mb-1">Inquiry Status: Finalizing</p>
              <h4 className="text-4xl font-serif tracking-tighter">
                {data.service_package || "Standard"} <span className="text-xl opacity-50 italic">Selection</span>
              </h4>
            </div>
          </div>
          <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-[#D4AF37]/20 pt-4 md:pt-0 md:pl-10">
            <p className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-1">Projected Investment</p>
            <p className="text-4xl font-serif text-[#D4AF37]">
              ₱{data.budget_min?.toLocaleString()} — ₱{data.budget_max?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border/20 border border-border/20">
        {/* Logistics */}
        <div className="bg-background p-8 space-y-6 hover:bg-card/5 transition-colors">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">The Event</h5>
            <div>
              <p className="text-2xl font-serif italic mb-1">{data.eventName}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">{data.occasion} Engagement</p>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Venue Address</h5>
            <div className="space-y-1">
              <p className="text-base font-serif">{data.city}, {data.province}</p>
              <p className="text-[11px] opacity-40 font-serif italic leading-relaxed line-clamp-2">{data.address}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-background p-8 space-y-6 hover:bg-card/5 transition-colors">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Timeline</h5>
            <p className="text-xl font-serif underline underline-offset-4 decoration-border/50">{data.eventDate}</p>
            <p className="text-base font-serif opacity-60">Curated service at {data.time}</p>
          </div>
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Guest Scale ({totalPax})</h5>
            <div className="grid grid-cols-2 gap-y-3 text-[9px] uppercase tracking-[0.2em]">
              {Object.entries(data.pax || {}).map(([k, v]: any) => v > 0 && (
                <div key={k} className="flex flex-col">
                  <span className="opacity-30 mb-0.5">{k}</span>
                  <span className="font-black text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Palette & Health */}
        <div className="bg-background p-8 space-y-6 hover:bg-card/5 transition-colors">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Culinary Palette</h5>
            <p className="text-2xl font-serif italic underline underline-offset-4 decoration-[#D4AF37]/30">{data.selected_menu_theme}</p>
            <p className="text-[9px] uppercase tracking-widest opacity-40 pt-1">{data.catalog_selections?.length || 0} Artisan Elements</p>
          </div>
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-red-500/50 font-black border-b border-red-500/10 pb-2">Allergy Watch</h5>
            <p className="text-[11px] font-serif italic opacity-70 leading-relaxed">
              {[...(data.allergies || []), data.custom_allergy].filter(Boolean).length > 0 
                ? [...(data.allergies || []), data.custom_allergy].filter(a => a !== 'Other' && Boolean(a)).join(" • ") 
                : "No strict ingredient exclusions."}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="relative border border-border p-8 bg-card/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
          <Target size={16} className="text-[#D4AF37] opacity-40" />
        </div>
        <h5 className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] font-black mb-3 text-center">Consultation Notes</h5>
        <p className="text-lg font-serif italic text-center max-w-2xl mx-auto leading-relaxed opacity-80 line-clamp-3">
          "{data.notes || "This experience is poised for creative chef intervention without further constraints."}"
        </p>
      </div>
    </div>
  );
}