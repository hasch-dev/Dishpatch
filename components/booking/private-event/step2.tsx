"use client";
import { PhoneInput } from "@/components/booking/shared/phone-input";
import { LocationSelector } from "@/components/booking/shared/location-selector";

export default function Step2Logistics({ data, update }: any) {
  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Host Name</label>
          <input 
            className="w-full bg-transparent border-b border-border py-4 text-2xl font-serif outline-none"
            value={data.hostName}
            onChange={e => update({ hostName: e.target.value })}
          />
        </div>
        <PhoneInput value={data.phone} code={data.countryCode} onChange={update} />
      </div>
      <LocationSelector city={data.city} province={data.province} address={data.address} update={update} />
    </div>
  );
}