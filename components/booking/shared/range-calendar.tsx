"use client";
import { format, addMonths } from "date-fns";

export function RangeCalendar({ startDate, endDate, onChange }: any) {
  const minDate = format(addMonths(new Date(), 1), 'yyyy-MM-dd');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Target Start Date</label>
        <input 
          type="date" 
          min={minDate}
          className="w-full bg-card border border-border p-6 text-xl outline-none focus:border-primary"
          value={startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
        />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Target End Date</label>
        <input 
          type="date" 
          min={startDate || minDate}
          className="w-full bg-card border border-border p-6 text-xl outline-none focus:border-primary"
          value={endDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
        />
      </div>
    </div>
  );
}