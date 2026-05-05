"use client";
import { Check } from "lucide-react";

export default function Step5Packages({ data, update }: any) {
  const PACKAGES = [
    { title: "Standard", price: "80,000", duration: "1 Week", desc: "Audit & Core Report" },
    { title: "Premium", price: "150,000", duration: "2-4 Weeks", desc: "Strategy & Implementation" },
    { title: "Luxury", price: "400,000", duration: "1 Month+", desc: "Full Operational Overhaul" }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
      {PACKAGES.map(p => (
        <button key={p.title} onClick={() => update({ package: p.title })} className={`p-10 text-left border flex flex-col gap-6 transition-all ${data.package === p.title ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"}`}>
          <div className="flex justify-between items-start">
            <h4 className="text-2xl font-serif">{p.title}</h4>
            {data.package === p.title && <Check className="text-primary" />}
          </div>
          <p className="text-3xl font-serif">₱{p.price}</p>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{p.duration}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-40">{p.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}