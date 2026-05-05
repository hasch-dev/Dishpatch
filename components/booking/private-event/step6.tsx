"use client";
export default function Step6Notes({ data, update }: any) {
  const TIERS = [
    { name: "Standard", price: "2,000", desc: "Essential Service" },
    { name: "Premium", price: "2,500", desc: "Enhanced Experience" },
    { name: "Luxury", price: "4,000", desc: "Signature Excellence" }
  ];
  return (
    <div className="space-y-16 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map(t => (
          <button key={t.name} onClick={() => update({ serviceTier: t.name })} className={`p-8 text-left border transition-all ${data.serviceTier === t.name ? "border-primary bg-primary/5" : "border-border"}`}>
            <p className="text-xl font-serif">{t.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-primary mb-4">₱{t.price} / Pax Base</p>
            <p className="text-[9px] uppercase tracking-widest opacity-40">{t.desc}</p>
          </button>
        ))}
      </div>
      <textarea className="w-full h-48 bg-card border border-border p-8 text-lg outline-none" placeholder="Chef's Notes & Special Requests..." value={data.notes} onChange={e => update({ notes: e.target.value })} />
    </div>
  );
}