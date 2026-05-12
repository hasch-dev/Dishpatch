"use client";
import { useState } from "react";
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function RangeCalendar({ startDate, endDate, onChange }: any) {
  // Business logic: 1 month lead time
  const minDate = addMonths(new Date(), 1); 
  
  // Set initial view to the minimum allowed month
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(minDate));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const handleDateClick = (day: Date) => {
    if (isBefore(day, minDate)) return;
    
    const formatted = format(day, 'yyyy-MM-dd');
    
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: formatted, endDate: "" });
    } else if (formatted < startDate) {
      onChange({ startDate: formatted, endDate: "" });
    } else {
      onChange({ startDate, endDate: formatted });
    }
  };

  // Prevent navigating to months before the booking window
  const isPrevDisabled = isSameMonth(currentMonth, minDate) || isBefore(currentMonth, minDate);

  return (
    <div className="w-full max-w-sm bg-card/30 border border-border p-6 select-none mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">
          {format(currentMonth, "MMMM yyyy")}
        </h4>
        <div className="flex gap-2">
          <button 
            onClick={() => !isPrevDisabled && setCurrentMonth(subMonths(currentMonth, 1))}
            className={`p-1 transition-opacity ${isPrevDisabled ? "opacity-10 cursor-not-allowed" : "hover:text-[#D4AF37]"}`}
            disabled={isPrevDisabled}
          >
            <ChevronLeft size={14}/>
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:text-[#D4AF37] transition-colors"
          >
            <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-[7px] uppercase font-bold opacity-30 text-center mb-2">{d}</div>
        ))}
        {days.map((day, i) => {
          const isSelected = isSameDay(day, new Date(startDate)) || isSameDay(day, new Date(endDate));
          const isInRange = startDate && endDate && day > new Date(startDate) && day < new Date(endDate);
          const isDisabled = isBefore(day, minDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                aspect-square flex items-center justify-center text-[11px] transition-all relative
                ${!isCurrentMonth ? "opacity-0 pointer-events-none" : ""} 
                ${isDisabled ? "opacity-20 cursor-not-allowed" : "hover:bg-[#D4AF37]/10"}
                ${isSelected ? "bg-[#D4AF37] text-black font-bold" : ""}
                ${isInRange ? "bg-[#D4AF37]/10 text-[#D4AF37]" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex justify-between text-[9px] uppercase tracking-widest">
        <span className="opacity-40">Range:</span>
        <span className="font-bold text-[#D4AF37] italic">
          {startDate ? format(new Date(startDate), "MMM dd") : "—"} 
          {endDate ? ` to ${format(new Date(endDate), "MMM dd")}` : ""}
        </span>
      </div>
    </div>
  );
}