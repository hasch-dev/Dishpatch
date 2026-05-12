"use client";
import { useState } from "react";
import { ShieldCheck, Sparkles, Crown, MapPin, Video, Globe, Coffee, Info, HelpCircle } from "lucide-react";

const PACKAGES = [
  { id: "Standard", price: "80,000", duration: "1 Week", icon: ShieldCheck, desc: "Audit & Core Report" },
  { id: "Premium", price: "150,000", duration: "2-4 Weeks", icon: Sparkles, desc: "Strategy & Implementation" },
  { id: "Luxury", price: "400,000", duration: "1 Month+", icon: Crown, desc: "Full Operational Overhaul" }
];

const FORMATS = [
  { 
    id: "On-Site", 
    icon: MapPin, 
    label: "On-Site", 
    summary: "I will personally travel to your location for a hands-on kitchen and service audit.",
    tooltip: "Best for: Operational efficiency, staff training, and physical workflow optimization."
  },
  { 
    id: "Virtual", 
    icon: Video, 
    label: "Virtual", 
    summary: "Conducted entirely via high-definition video calls and digital data sharing.",
    tooltip: "Best for: Concept development, branding, and high-level strategic planning."
  },
  { 
    id: "Hybrid", 
    icon: Globe, 
    label: "Hybrid", 
    summary: "A blend of digital preparation and a targeted 2-day physical site visit.",
    tooltip: "Best for: International clients or complex projects requiring both deep data and a site visit."
  },
  { 
    id: "Retreat", 
    icon: Coffee, 
    label: "Retreat", 
    summary: "An immersive 3-day strategy session at a curated off-site luxury location.",
    tooltip: "Best for: Radical rebranding, manifesto building, and distraction-free leadership focus."
  }
];

export default function Step5Packages({ data, update }: any) {
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);

  const selectedFormatData = FORMATS.find(f => f.id === data.delivery_format);

  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-12 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Package Selection */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Engagement Level</label>
          <div className="space-y-3">
            {PACKAGES.map(p => (
              <button 
                key={p.id} 
                onClick={() => update({ consultation_package: p.id })}
                className={`w-full p-6 border flex items-center gap-6 transition-all ${
                  data.consultation_package === p.id ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_20px_-10px_rgba(212,175,55,0.2)]" : "border-border opacity-40 hover:opacity-100"
                }`}
              >
                <p.icon size={24} className={data.consultation_package === p.id ? "text-[#D4AF37]" : ""} />
                <div className="text-left flex-1">
                  <p className="text-lg font-serif">{p.id}</p>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">{p.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-serif text-[#D4AF37]">₱{p.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Format & Notes */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Delivery Format</label>
              {/* Tooltip Display */}
              <div className="flex items-center gap-2 h-4">
                {hoveredFormat && (
                  <p className="text-[10px] italic text-[#D4AF37] animate-in slide-in-from-right-2">
                    {FORMATS.find(f => f.id === hoveredFormat)?.tooltip}
                  </p>
                )}
                <HelpCircle size={12} className="opacity-20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map(f => (
                <button 
                  key={f.id}
                  onMouseEnter={() => setHoveredFormat(f.id)}
                  onMouseLeave={() => setHoveredFormat(null)}
                  onClick={() => update({ delivery_format: f.id })}
                  className={`relative flex flex-col items-center gap-3 p-6 border transition-all overflow-hidden ${
                    data.delivery_format === f.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "border-border opacity-40 hover:opacity-100"
                  }`}
                >
                  <f.icon size={20} />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Selection Summary Box */}
            <div className="h-16 flex items-center">
              {selectedFormatData ? (
                <div className="w-full p-4 border-l-2 border-[#D4AF37] bg-[#D4AF37]/5 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <Info size={14} className="text-[#D4AF37] mt-1 shrink-0" />
                    <p className="text-sm font-serif italic opacity-80 leading-relaxed text-primary">
                      {selectedFormatData.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] uppercase tracking-widest opacity-20 text-center w-full">Select a format to see details</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Logistical Notes</label>
            <textarea 
              className="w-full h-32 bg-card/20 border border-border p-5 text-lg font-serif outline-none focus:border-[#D4AF37] italic resize-none placeholder:opacity-20"
              placeholder="e.g. Preferred timezones for virtual calls, or specific site access details..."
              value={data.notes || ""}
              onChange={e => update({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}