"use client";
import { RangeCalendar } from "@/components/booking/shared/range-calendar";

export default function Step3Schedule({ data, update }: any) {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in items-start">
      <div className="lg:col-span-1 space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">The Timeline</p>
          <h3 className="text-3xl font-serif italic">When should the experience begin?</h3>
        </div>
        <div className="flex border border-border p-1 bg-muted/5">
          {["Noon", "Evening"].map(t => (
            <button key={t} onClick={() => update({ time: t })} className={`flex-1 py-4 text-[9px] uppercase tracking-widest font-bold transition-all ${data.time === t ? "bg-[#D4AF37] text-black" : "opacity-40 hover:opacity-100"}`}>{t}</button>
          ))}
        </div>
        <p className="text-[10px] leading-relaxed opacity-40 italic">Note: Dishpatch requires a 1-month lead time for all private bookings.</p>
      </div>
      <div className="lg:col-span-2 flex justify-center lg:justify-end">
        <RangeCalendar startDate={data.eventDate} endDate={data.eventEndDate} onChange={(d: any) => update({ eventDate: d.startDate, eventEndDate: d.endDate })} />
      </div>
    </div>
  );
}