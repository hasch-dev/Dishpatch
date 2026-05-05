"use client";
import { PhoneInput } from "../shared/phone-input";
import { LocationSelector } from "../shared/location-selector";

export default function Step2Identity({ data, update }: any) {
  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <input className="w-full bg-transparent border-b border-border py-4 text-2xl font-serif outline-none" placeholder="Company Name" value={data.company} onChange={e => update({ company: e.target.value })} />
        <PhoneInput value={data.phone} code={data.countryCode} onChange={update} />
      </div>
      <LocationSelector city={data.city} province={data.province} address={data.address} update={update} />
    </div>
  );
}