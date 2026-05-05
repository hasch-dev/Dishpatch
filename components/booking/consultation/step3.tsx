"use client";
import { RangeCalendar } from "../shared/range-calendar";

export default function Step3Calendar({ data, update }: any) {
  return (
    <div className="animate-in fade-in">
      <label className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary mb-8 block">Project Timeline</label>
      <RangeCalendar startDate={data.startDate} endDate={data.endDate} onChange={update} />
    </div>
  );
}