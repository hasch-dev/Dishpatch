"use client";
export default function Step1Intro({ data, update }: any) {
  const STAGES = ["Starting from Scratch", "Building from Plan", "Troubleshooting", "Other"];
  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Consultation Name</label>
        <input className="w-full bg-transparent border-b border-border py-4 text-4xl font-serif outline-none" value={data.name} onChange={e => update({ name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAGES.map(s => (
          <button key={s} onClick={() => update({ stage: s })} className={`p-6 text-[10px] uppercase tracking-widest font-bold border transition-all ${data.stage === s ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}