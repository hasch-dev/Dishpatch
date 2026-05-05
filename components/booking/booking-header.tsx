"use client";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingHeaderProps {
  step: number;
  totalSteps: number;
}

export default function BookingHeader({ step, totalSteps }: BookingHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex-shrink-0 z-30 w-full bg-background/95 backdrop-blur border-b border-border py-8 px-6 flex justify-center">
      <div className="w-full max-w-7xl flex justify-between items-center">
        <button 
          onClick={() => router.push("/booking/new")} 
          className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:text-primary transition-colors"
        >
          <X size={14} className="inline mr-2" /> Change Event
        </button>
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
          Step {step} / {totalSteps}
        </span>
      </div>
    </header>
  );
}