"use client";
import { AlertCircle, Landmark } from "lucide-react";

export default function Step5Finances({ data, update }: any) {
  
  // Helper to format raw numbers to currency string for display
  const formatDisplay = (val: string | number) => {
    if (!val) return "";
    return val.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper to handle numeric change for the DB
  const handleChange = (key: string, rawValue: string) => {
    const numericValue = rawValue.replace(/\D/g, "");
    update({ [key]: numericValue });
  };

  return (
    <div className="h-full flex flex-col justify-center max-w-3xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header & Numerical Warning */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-sm">
            <Landmark size={20} className="text-[#D4AF37]" />
          </div>
        </div>
        <h3 className="text-4xl font-serif italic tracking-tight">Financial Parameters</h3>
        
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500/5 border border-amber-500/20 text-amber-600/80 rounded-full">
          <AlertCircle size={12} />
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
            Ensure numerical accuracy to define your proposal scope.
          </p>
        </div>
      </div>

      {/* Primary Budget Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40 border border-border/40 rounded-sm overflow-hidden shadow-sm">
        
        {/* Min Budget */}
        <div className="bg-background p-8 space-y-4 group hover:bg-card/5 transition-all">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-[#D4AF37]">Budget Floor</label>
            <span className="text-[9px] opacity-40 font-serif italic">Minimum</span>
          </div>
          <div className="relative flex items-center pt-2">
            <span className="text-2xl font-serif text-[#D4AF37] mr-3 opacity-50">₱</span>
            <input 
              type="text"
              inputMode="numeric"
              className="w-full bg-transparent text-3xl font-serif outline-none placeholder:opacity-20 transition-all focus:tracking-tighter"
              placeholder="0"
              value={formatDisplay(data.budgetMin)}
              onChange={(e) => handleChange("budgetMin", e.target.value)}
            />
          </div>
        </div>

        {/* Max Budget */}
        <div className="bg-background p-8 space-y-4 group hover:bg-card/5 transition-all">
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-[#D4AF37]">Budget Ceiling</label>
            <span className="text-[9px] opacity-40 font-serif italic">Maximum</span>
          </div>
          <div className="relative flex items-center pt-2">
            <span className="text-2xl font-serif text-[#D4AF37] mr-3 opacity-50">₱</span>
            <input 
              type="text"
              inputMode="numeric"
              className="w-full bg-transparent text-3xl font-serif outline-none placeholder:opacity-20 transition-all focus:tracking-tighter"
              placeholder="0"
              value={formatDisplay(data.budgetMax)}
              onChange={(e) => handleChange("budgetMax", e.target.value)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}