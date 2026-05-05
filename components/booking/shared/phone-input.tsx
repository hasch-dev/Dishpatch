"use client";
import { Search } from "lucide-react";

export function PhoneInput({ value, code, onChange }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">Contact Number</label>
      <div className="flex gap-4 border-b border-border py-4">
        <div className="flex items-center gap-2 pr-4 border-r border-border min-w-[100px]">
          <span className="text-xl font-serif">{code}</span>
        </div>
        <input 
          type="tel"
          className="bg-transparent w-full text-2xl font-serif outline-none"
          placeholder="917 123 4567"
          value={value}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>
    </div>
  );
}