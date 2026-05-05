"use client";

export function LocationSelector({ city, province, address, update }: any) {
  const PROVINCES = ["Metro Manila", "Cavite", "Laguna", "Batangas", "Rizal", "Bulacan"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Province</label>
          <select 
            className="w-full bg-transparent border-b border-border py-4 text-xl font-serif outline-none"
            value={province}
            onChange={(e) => update({ province: e.target.value })}
          >
            <option value="">Select Province</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">City / Municipality</label>
          <input 
            className="w-full bg-transparent border-b border-border py-4 text-xl font-serif outline-none"
            placeholder="e.g. Lipa City"
            value={city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Full Delivery Address</label>
        <input 
          className="w-full bg-transparent border-b border-border py-4 text-xl outline-none"
          placeholder="House No., Street, Subdivision..."
          value={address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </div>
    </div>
  );
}