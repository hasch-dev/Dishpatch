"use client";
export default function Step1Identity({ data, update }: any) {
  const OCCASIONS = ["Wedding", "Birthday", "Corporate", "Anniversary", "Holiday", "Engagement", "Launch", "Other"];
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in">
      <div className="relative pt-8">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#D4AF37] absolute top-0">Event Identity</label>
        <input className="w-full bg-transparent border-b border-border py-6 text-5xl font-serif outline-none focus:border-[#D4AF37] transition-all placeholder:opacity-10" placeholder="The Santos Soirée" value={data.eventName || ""} onChange={e => update({ eventName: e.target.value })} />
      </div>
      <div className="space-y-6">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Select Occasion</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {OCCASIONS.map(o => (
            <button key={o} onClick={() => update({ occasion: o })} className={`py-6 border text-[9px] uppercase tracking-widest font-bold transition-all ${data.occasion === o ? "border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]" : "border-border opacity-40 hover:opacity-100"}`}>
              {o}
            </button>
          ))}
        </div>
        {data.occasion === "Other" && (
          <input className="w-full bg-transparent border-b border-[#D4AF37]/20 py-2 text-xl font-serif italic outline-none animate-in slide-in-from-top-2" placeholder="Specify occasion..." value={data.customOccasion || ""} onChange={e => update({ customOccasion: e.target.value })} />
        )}
      </div>
    </div>
  );
}