"use client";
export default function Step5Finances({ data, update }: any) {
  const ALLERGIES = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Eggs", "Soy", "Tree Nuts", "Other"];
  return (
    <div className="space-y-20 animate-in fade-in">
      <div className="text-center space-y-4">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Event Budget (PHP)</label>
        <input 
          className="w-full bg-transparent border-b border-border py-12 text-7xl font-serif text-center outline-none" 
          placeholder="000,000"
          value={data.budget} 
          onChange={e => update({ budget: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",") })} 
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ALLERGIES.map(a => (
          <button key={a} onClick={() => update({ allergies: data.allergies.includes(a) ? data.allergies.filter((i:any) => i !== a) : [...data.allergies, a] })} className={`p-6 text-[10px] uppercase tracking-widest font-bold border transition-all ${data.allergies.includes(a) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}