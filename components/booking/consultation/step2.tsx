"use client";
import { useState, useMemo } from "react";
import { Search, ChevronDown, MapPin, Building2 } from "lucide-react";
import { TooltipWrapper } from "@/components/booking/shared/tooltip-wrapper";
import { PHONE_NUMBERS, PHILIPPINES_LOCATIONS } from "@/constants/booking-data";

export default function Step2Identity({ data, update }: any) {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = useMemo(() => 
    PHONE_NUMBERS.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)
    ), [countrySearch]);

  const handleProvinceChange = (province: string) => {
    update({ province, city: "" });
    setIsProvOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Company & Phone Row */}
      <div className="flex flex-col md:flex-row md:items-end gap-24">
        <div className="flex-1">
          <TooltipWrapper text="The registered name of your organization or business entity.">
            <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Company Name</label>
          </TooltipWrapper>
          <div className="relative">
            <input 
              className="w-full bg-transparent border-b border-border py-3 text-2xl font-serif outline-none focus:border-[#D4AF37] transition-all"
              placeholder="e.g. Acme Corp"
              value={data.company}
              onChange={e => update({ company: e.target.value })}
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Contact Details</label>
          <div className="flex items-end border-b border-border focus-within:border-[#D4AF37] relative pb-2">
            <button 
              type="button"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-card/10 text-lg font-serif hover:text-[#D4AF37] transition-colors"
            >
              {data.countryCode || "+63"} <ChevronDown size={14} className="opacity-40" />
            </button>
            
            <input 
              type="text"
              inputMode="numeric"
              className="flex-1 bg-transparent py-2 pl-4 text-2xl font-serif outline-none"
              placeholder="917 000 0000"
              value={data.phone}
              onChange={e => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                update({ phone: onlyNums });
              }}
            />

            {isCountryOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-background border border-[#D4AF37]/20 z-50 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-border flex gap-2 items-center bg-card/30">
                  <Search size={14} className="opacity-30" />
                  <input 
                    className="bg-transparent text-[10px] uppercase tracking-widest outline-none w-full" 
                    placeholder="Search Country..." 
                    value={countrySearch} 
                    onChange={e => setCountrySearch(e.target.value)} 
                  />
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredCountries.map(c => (
                    <div 
                      key={c.iso} 
                      onClick={() => { update({ countryCode: c.code }); setIsCountryOpen(false); }} 
                      className="p-4 flex justify-between hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <span>{c.name}</span> <span className="opacity-60">{c.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-12 pt-8 border-t border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Province Selector */}
          <div className="space-y-4 relative">
            <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Province</label>
            <button 
              type="button"
              onClick={() => setIsProvOpen(!isProvOpen)} 
              className="w-full flex justify-between items-center bg-card/10 border border-border p-6 text-xl font-serif hover:border-[#D4AF37] transition-all"
            >
              {data.province || "Select Province"} <ChevronDown size={18} />
            </button>
            {isProvOpen && (
              <div className="absolute top-full left-0 w-full bg-background border border-[#D4AF37]/20 z-50 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
                {Object.keys(PHILIPPINES_LOCATIONS).map(p => (
                  <div 
                    key={p} 
                    onClick={() => handleProvinceChange(p)} 
                    className="p-5 hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[10px] uppercase font-bold tracking-widest border-b border-border/10 last:border-0"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* City Selector */}
          <div className="space-y-4 relative">
            <label className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-opacity ${!data.province ? 'opacity-20' : 'text-[#D4AF37]'}`}>
              City / Municipality
            </label>
            <button 
              type="button"
              disabled={!data.province} 
              onClick={() => setIsCityOpen(!isCityOpen)} 
              className="w-full flex justify-between items-center bg-card/10 border border-border p-6 text-xl font-serif hover:border-[#D4AF37] disabled:opacity-20 transition-all"
            >
              {data.city || "Select City"} <ChevronDown size={18} />
            </button>
            {isCityOpen && data.province && (
              <div className="absolute top-full left-0 w-full bg-background border border-[#D4AF37]/20 z-50 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
                {PHILIPPINES_LOCATIONS[data.province].map(c => (
                  <div 
                    key={c} 
                    onClick={() => { update({ city: c }); setIsCityOpen(false); }} 
                    className="p-5 hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[10px] uppercase font-bold tracking-widest border-b border-border/10 last:border-0"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Address */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Headquarters / Office Address</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-0 top-6 text-[#D4AF37] opacity-40" />
            <textarea 
              rows={2} 
              className="w-full bg-transparent border-b border-border pt-5 pb-2 pl-10 text-2xl font-serif outline-none focus:border-[#D4AF37] resize-none transition-all" 
              placeholder="Building, Floor, Street, Barangay..." 
              value={data.address} 
              onChange={e => update({ address: e.target.value })} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}