"use client";
import { RangeCalendar } from "@/components/booking/shared/range-calendar";
import { ChevronUp, ChevronDown } from "lucide-react";

const TIME_SLOTS = ["Breakfast", "Lunch", "Dinner"];

export default function Step3Schedule({ data, update }: any) {
  
  const currentHour = data.customTime?.split(':')[0] || "19";
  const currentMinute = data.customTime?.split(':')[1] || "00";
  const ampm = parseInt(currentHour, 10) >= 12 ? "PM" : "AM";

  const autoDetectSlot = (h: string, m: string) => {
    const timeVal = parseInt(h, 10);
    if (timeVal >= 0 && timeVal < 12) return "Breakfast";
    if (timeVal >= 12 && timeVal < 17) return "Lunch";
    if (timeVal >= 17 && timeVal <= 23) return "Dinner";
    return data.timeSlot;
  };

  const updateTime = (h: string, m: string) => {
    const newSlot = autoDetectSlot(h, m);
    update({ customTime: `${h}:${m}`, timeSlot: newSlot });
  };

  const incHour = () => updateTime(((parseInt(currentHour, 10) + 1) % 24).toString().padStart(2, '0'), currentMinute);
  const decHour = () => updateTime(((parseInt(currentHour, 10) - 1 + 24) % 24).toString().padStart(2, '0'), currentMinute);
  const incMinute = () => updateTime(currentHour, ((parseInt(currentMinute, 10) + 1) % 60).toString().padStart(2, '0'));
  const decMinute = () => updateTime(currentHour, ((parseInt(currentMinute, 10) - 1 + 60) % 60).toString().padStart(2, '0'));

  const handleDirectInput = (type: "hour" | "minute", value: string) => {
    let num = parseInt(value || "0", 10);
    if (type === "hour") {
      updateTime(Math.min(Math.max(num, 0), 23).toString().padStart(2, "0"), currentMinute);
    } else {
      updateTime(currentHour, Math.min(Math.max(num, 0), 59).toString().padStart(2, "0"));
    }
  };

  const handleTimeSlotSelect = (slot: string) => {
    let newHour = currentHour;
    if (slot === "Breakfast") newHour = "08";
    else if (slot === "Lunch") newHour = "12";
    else if (slot === "Dinner") newHour = "17";
    update({ timeSlot: slot, customTime: `${newHour}:${currentMinute}` });
  };

  return (
    <div className="w-full mx-auto flex flex-row items-center justify-between p-16 gap-12 animate-in fade-in items-start">
      <div className="w-full space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">The Timeline</p>
          <h3 className="text-3xl font-serif italic">When should the experience begin?</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1 border border-border p-1 bg-muted/5">
            {TIME_SLOTS.map(t => (
              <button 
                key={t} 
                onClick={() => handleTimeSlotSelect(t)} 
                className={`py-4 text-[9px] uppercase tracking-widest font-bold transition-all ${
                  data.timeSlot === t ? "bg-[#D4AF37] text-black" : "opacity-40 hover:opacity-100 hover:bg-card/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {data.timeSlot && (
            <div className="p-5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 animate-in slide-in-from-top-2">
              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={incHour} className="text-[#D4AF37]/50"><ChevronUp size={24} /></button>
                  <input 
                    type="number" 
                    value={currentHour} 
                    onChange={(e) => handleDirectInput("hour", e.target.value)} 
                    className="w-16 h-14 bg-background border border-[#D4AF37]/50 text-2xl font-serif text-center outline-none focus:border-[#D4AF37] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button onClick={decHour} className="text-[#D4AF37]/50"><ChevronDown size={24} /></button>
                </div>
                <span className="text-3xl font-serif text-[#D4AF37] pb-1">:</span>
                <div className="flex flex-col items-center gap-1">
                  <button onClick={incMinute} className="text-[#D4AF37]/50"><ChevronUp size={24} /></button>
                  <input 
                    type="number" 
                    value={currentMinute} 
                    onChange={(e) => handleDirectInput("minute", e.target.value)} 
                    className="w-16 h-14 bg-background border border-[#D4AF37]/50 text-2xl font-serif text-center outline-none focus:border-[#D4AF37] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button onClick={decMinute} className="text-[#D4AF37]/50"><ChevronDown size={24} /></button>
                </div>
                <div className="ml-2 bg-[#D4AF37]/10 border border-[#D4AF37]/50 h-14 px-4 flex justify-center items-center w-16">
                  <span className="text-xl font-serif text-[#D4AF37]">{ampm}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-row items-center justify-end">
        <RangeCalendar startDate={data.eventDate} endDate={data.eventEndDate} onChange={(d: any) => update({ eventDate: d.startDate, eventEndDate: d.endDate })} />
      </div>
    </div>
  );
}