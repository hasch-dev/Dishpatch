"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BookingFooterProps {
  step: number;
  totalSteps: number;
  canContinue: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function BookingFooter({ 
  step, 
  totalSteps, 
  canContinue, 
  onNext, 
  onPrev 
}: BookingFooterProps) {
  return (
    <footer className="flex-shrink-0 z-30 w-full bg-background border-t border-border py-6 px-6 flex justify-center">
      <div className="w-full max-w-7xl flex justify-between items-center">
        <button 
          onClick={onPrev} 
          disabled={step === 1} 
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold disabled:opacity-0 transition-opacity"
        >
          <ArrowLeft size={14} /> Previous
        </button>
        
        <button 
          onClick={onNext}
          disabled={!canContinue}
          className="bg-primary text-primary-foreground px-16 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 disabled:opacity-20 transition-all"
        >
          {step === totalSteps ? "Confirm & Submit" : "Next Step"} <ArrowRight size={14} className="inline ml-2" />
        </button>
      </div>
    </footer>
  );
}