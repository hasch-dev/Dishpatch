"use client";
import { TooltipWrapper } from "@/components/booking/shared/tooltip-wrapper";
import { Check, Target, Sparkles } from "lucide-react";

const CONSULTATION_TARGETS = [
  { id: "Kitchen Efficiency", sub: "Workflow & Speed" },
  { id: "Menu Engineering", sub: "Design & Profitability" },
  { id: "Staff Training", sub: "Skills & Service" },
  { id: "Cost Control", sub: "COGS & Labor" },
  { id: "Branding", sub: "Identity & Vision" },
  { id: "Inventory System", sub: "Stock Management" },
  { id: "Hygiene Audit", sub: "Safety & Compliance" },
  { id: "Sourcing", sub: "Supplier Relations" },
  { id: "Waste Management", sub: "Sustainability" },
  { id: "Marketing", sub: "Growth & Reach" },
  { id: "Equipment Audit", sub: "Tools & Maintenance" },
  { id: "Other", sub: "Custom Focus" }
];

export default function Step4Objectives({ data, update }: any) {
  // Toggle logic for multi-select
  const toggleFocus = (id: string) => {
    const current = data.areas_of_focus || [];
    const next = current.includes(id) 
      ? current.filter((i: string) => i !== id) 
      : [...current, id];
    update({ areas_of_focus: next });
  };

  return (
    <div className="h-full flex flex-col justify-center max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20">
            <Target size={20} className="text-[#D4AF37]" />
          </div>
        </div>
        <h3 className="text-4xl font-serif italic tracking-tight">Strategic Objectives</h3>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Select all areas requiring artisan intervention</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Selection Grid */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONSULTATION_TARGETS.map(t => {
              const isActive = data.areas_of_focus?.includes(t.id);
              return (
                <button 
                  key={t.id} 
                  onClick={() => toggleFocus(t.id)} 
                  className={`relative p-5 text-left border transition-all group overflow-hidden ${
                    isActive 
                    ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_20px_-10px_rgba(212,175,55,0.2)]" 
                    : "border-border hover:border-[#D4AF37]/30"
                  }`}
                >
                  <div className="relative z-10">
                    <p className={`text-[9px] uppercase tracking-[0.2em] font-black mb-1 ${isActive ? "text-[#D4AF37]" : "opacity-40"}`}>
                      {t.id}
                    </p>
                    <p className="text-[10px] font-serif italic opacity-60 leading-tight">{t.sub}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 text-[#D4AF37]">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Narrative Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <TooltipWrapper text="Describe the specific challenges or the vision you have for this consultation.">
              <label className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37]">Objective Narrative</label>
            </TooltipWrapper>
            <p className="text-[11px] opacity-40 font-serif italic">Elaborate on your goals and expectations.</p>
          </div>
          
          <div className="relative group">
            <textarea 
              className="w-full h-64 bg-card/20 border border-border p-6 text-lg font-serif outline-none focus:border-[#D4AF37] transition-all resize-none placeholder:opacity-20 italic"
              placeholder="e.g. We are looking to reduce food waste by 15% while modernizing our heritage menu..."
              value={data.objective_explanation}
              onChange={e => update({ objective_explanation: e.target.value })}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[8px] uppercase tracking-widest opacity-20 group-focus-within:opacity-40">
              <Sparkles size={10} />
              Artisan Brief
            </div>
          </div>

          {/* Focus Counter Indicator */}
          <div className="pt-4 border-t border-border/30 flex justify-between items-center">
            <span className="text-[9px] uppercase tracking-widest opacity-30">Selection Count</span>
            <span className="text-xl font-serif text-[#D4AF37]">{data.areas_of_focus?.length || 0} / 12</span>
          </div>
        </div>
      </div>
    </div>
  );
}