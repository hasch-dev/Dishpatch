"use client";
export default function Step4Objectives({ data, update }: any) {
  const TARGETS = ["Kitchen Efficiency", "Menu Engineering", "Staff Training", "Cost Control", "Branding", "Inventory System", "Hygiene Audit", "Sourcing", "Waste Management", "Marketing", "Equipment Audit", "Other"];
  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {TARGETS.map(t => (
          <button key={t} onClick={() => update({ target: t })} className={`p-8 text-[10px] uppercase tracking-widest font-bold border ${data.target === t ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}>
            {t}
          </button>
        ))}
      </div>
      <textarea className="w-full h-64 bg-card border border-border p-8 text-xl outline-none focus:border-primary" placeholder="Explain your Goals..." value={data.objectiveDetails} onChange={e => update({ objectiveDetails: e.target.value })} />
    </div>
  );
}