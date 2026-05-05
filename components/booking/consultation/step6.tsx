"use client";
export default function Step6Summary({ data }: any) {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in text-center">
      <h3 className="text-4xl font-serif italic">Review Proposal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left border-y border-border py-12">
        <div>
          <p className="text-[8px] uppercase tracking-widest opacity-40">Consultation</p>
          <p className="text-xl font-serif">{data.name}</p>
        </div>
        <div>
          <p className="text-[8px] uppercase tracking-widest opacity-40">Package</p>
          <p className="text-xl font-serif text-primary">{data.package}</p>
        </div>
        <div>
          <p className="text-[8px] uppercase tracking-widest opacity-40">Focus Area</p>
          <p className="text-xl font-serif">{data.target}</p>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">All parameters set. Ready for briefing.</p>
    </div>
  );
}