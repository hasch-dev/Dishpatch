"use client";
export default function Step1Occasion({ data, update }: any) {
  const OCCASIONS = ["Wedding", "Birthday", "Corporate", "Anniversary", "Holiday", "Engagement", "Launch", "Other"];
  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Event Title</label>
        <input 
          className="w-full bg-transparent border-b border-border py-4 text-4xl font-serif outline-none focus:border-primary"
          placeholder="e.g. The Santos Soirée"
          value={data.eventName}
          onChange={e => update({ eventName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {OCCASIONS.map(o => (
          <button 
            key={o}
            onClick={() => update({ occasion: o })}
            className={`py-8 text-[10px] uppercase tracking-widest font-bold border transition-all ${data.occasion === o ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}