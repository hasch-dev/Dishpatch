"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";

export function TooltipWrapper({ children, text }: { children: React.ReactNode, text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-2 group">
      {children}
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help opacity-30 hover:opacity-100 transition-opacity"
      >
        <HelpCircle size={12} />
      </div>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-primary text-primary-foreground text-[9px] uppercase tracking-widest leading-relaxed z-50 animate-in fade-in slide-in-from-bottom-1">
          {text}
        </div>
      )}
    </div>
  );
}