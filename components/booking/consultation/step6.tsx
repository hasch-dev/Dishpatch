"use client";
import { Target, Sparkles, Crown } from "lucide-react";

export default function Step6Summary({ data }: any) {
  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000 py-4">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-3 px-4 py-1 border border-[#D4AF37]/30 rounded-full mb-2">
          <Sparkles size={10} className="text-[#D4AF37]" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-[#D4AF37]">Final Review</span>
          <Sparkles size={10} className="text-[#D4AF37]" />
        </div>
        <h3 className="text-5xl font-serif italic text-primary tracking-tight">The Consultation Brief</h3>
      </div>

      {/* Hero Badge: Service Tier */}
      <div className="relative overflow-hidden bg-background border-2 border-[#D4AF37] p-1 rounded-sm shadow-[0_0_40px_-15px_rgba(212,175,55,0.3)]">
        <div className="bg-[#D4AF37]/10 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center text-black shadow-lg">
              <Crown size={28} strokeWidth={1.5} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-[#D4AF37] mb-1">Engagement Level</p>
              <h4 className="text-4xl font-serif tracking-tighter">
                {data.package || "Standard"} <span className="text-xl opacity-50 italic">Intervention</span>
              </h4>
            </div>
          </div>
          <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-[#D4AF37]/20 pt-4 md:pt-0 md:pl-10">
            <p className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-1">Target Action Dates</p>
            <p className="text-2xl font-serif text-[#D4AF37]">
              {data.startDate || "TBD"} {data.endDate ? `— ${data.endDate}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border/20 border border-border/20">
        
        {/* Identity */}
        <div className="bg-background p-8 space-y-6 hover:bg-card/5 transition-colors">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">The Entity</h5>
            <div>
              <p className="text-2xl font-serif italic mb-1">{data.company || "Not Specified"}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">{data.stage || "N/A"} Stage</p>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Primary Contact</h5>
            <div className="space-y-1">
              <p className="text-base font-serif">{data.name}</p>
              <p className="text-[11px] opacity-40 font-serif italic">{data.countryCode} {data.phone}</p>
            </div>
          </div>
        </div>

        {/* Logistics & Format */}
        <div className="bg-background p-8 space-y-6 bg-card/5">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Intervention Site</h5>
            <p className="text-xl font-serif">{data.city}, {data.province}</p>
            <p className="text-[11px] opacity-40 font-serif italic leading-relaxed line-clamp-2">{data.address}</p>
          </div>
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Selected Format</h5>
            <div className="flex items-center gap-2">
              {/* This now correctly displays On-Site, Virtual, etc. */}
              <p className="text-lg font-serif">{data.delivery_format || "Pending Selection"}</p>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="bg-background p-8 space-y-6 hover:bg-card/5 transition-colors">
          <div className="space-y-3">
            <h5 className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-black border-b border-[#D4AF37]/20 pb-2">Areas of Focus</h5>
            <div className="flex flex-wrap gap-2 pt-1">
              {data.areas_of_focus?.length > 0 ? (
                data.areas_of_focus.map((area: string) => (
                  <span key={area} className="text-[9px] uppercase tracking-widest border border-border px-2 py-1 bg-card/30">
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-[11px] font-serif italic opacity-40">No specific areas selected.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section - Narrative */}
      <div className="relative border border-border p-8 bg-card/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
          <Target size={16} className="text-[#D4AF37] opacity-40" />
        </div>
        <h5 className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] font-black mb-3 text-center">Objective Narrative</h5>
        <p className="text-lg font-serif italic text-center max-w-2xl mx-auto leading-relaxed opacity-80">
          "{data.objective_explanation || "No briefing provided. A strategic meeting will be required to align objectives."}"
        </p>
      </div>
    </div>
  );
}