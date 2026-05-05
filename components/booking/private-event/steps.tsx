"use client";
import { User, Clock, Users2 } from "lucide-react";

export function Step3Timeline({ data, update }: any) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary flex items-center gap-2"><Clock size={12}/> Preferred Time</label>
          <div className="flex border border-border">
            {["Noon", "Evening"].map(t => (
              <button key={t} onClick={() => update({ time: t })} className={`flex-1 py-4 text-[10px] uppercase tracking-widest font-bold ${data.time === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Estimated Duration</label>
          <input className="w-full bg-transparent border-b border-border py-4 text-xl outline-none" placeholder="e.g. 4 Hours" value={data.duration} onChange={e => update({ duration: e.target.value })} />
        </div>
      </div>

      <div className="space-y-8">
        <label className="text-[10px] uppercase tracking-widest font-bold text-primary flex items-center gap-2"><Users2 size={12}/> Guest Composition</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {["Adults", "Teens", "Seniors", "Children"].map(cat => (
            <div key={cat} className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest opacity-40">{cat}</span>
              <input type="number" className="w-full bg-transparent border-b border-border py-2 text-xl outline-none" value={data.pax[cat.toLowerCase()] || 0} onChange={e => update({ pax: { ...data.pax, [cat.toLowerCase()]: e.target.value } })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Step5Finances({ data, update }: any) {
  const ALLERGIES = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Eggs", "Soy", "Tree Nuts", "Other"];
  return (
    <div className="space-y-20">
      <div className="text-center space-y-4">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Event Budget (PHP)</label>
        <input 
          className="w-full bg-transparent border-b border-border py-12 text-7xl font-serif text-center outline-none" 
          placeholder="000,000"
          value={data.budget} 
          onChange={e => update({ budget: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })} 
        />
      </div>
      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold">Dietary Allergies</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ALLERGIES.map(a => (
            <button key={a} onClick={() => update({ allergies: data.allergies.includes(a) ? data.allergies.filter((i:any) => i !== a) : [...data.allergies, a] })} className={`p-6 text-[10px] uppercase tracking-widest font-bold border transition-all ${data.allergies.includes(a) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}