"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, PhilippinePeso, Clock, AlertTriangle, ArrowRight, Layers, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BookingReviewDrawerProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAccept: (finalizedTime: string) => void;
  isProcessing: boolean;
}

export default function BookingReviewDrawer({
  booking,
  isOpen,
  onClose,
  onConfirmAccept,
  isProcessing,
}: BookingReviewDrawerProps) {
  const [finalizedTime, setFinalizedTime] = useState(booking?.event_time_pref || "18:00");

  // Lock body scroll precisely to stop layout shifting
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!booking) return null;

  const isConsultation = booking.booking_type?.toLowerCase().includes("consultation");
  const eventDateStr = booking.event_date
    ? format(parseISO(booking.event_date), "MMMM dd, yyyy")
    : "TBD";

  const dataFields = [
    { icon: MapPin, label: "Deployment Coordinates", value: `${booking.location_address || ''}, ${booking.location_city || 'TBD'}` },
    { icon: Users, label: "Deployment Scope", value: `${booking.guest_count || '—'} Participants / ${booking.occasion || 'General Assignment'}` },
    { icon: Layers, label: "Service Specifications", value: `${booking.service_package || 'Standard Package'} / Theme: ${booking.selected_menu_theme || 'TBD'}` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative w-full max-w-xl h-full bg-card border-l border-border/20 shadow-2xl flex flex-col rounded-none overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-border/20 flex-shrink-0 bg-background relative">
              <div className="flex justify-between items-start mb-6 pr-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Ref_Matrix: #{booking.id.slice(0, 8).toUpperCase()}
                  </span>
                  <h2 className="text-3xl font-serif italic tracking-tighter text-foreground">
                    {booking.title || "Untitled Commission"}
                  </h2>
                </div>
                <div className="absolute top-8 right-8 flex gap-3">
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 border rounded-none shrink-0 h-fit",
                    isConsultation ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : "border-primary/20 text-primary bg-primary/5"
                  )}>
                    {isConsultation ? "Consultation" : "Private Chef"}
                  </span>
                  <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-none transition-colors text-muted-foreground hover:text-foreground shrink-0 h-fit">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-muted/20 p-5 border border-border/10">
                <PhilippinePeso className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div className="text-lg font-mono font-bold tracking-tight text-foreground/90 flex items-end gap-3">
                  {booking.budget_min?.toLocaleString()} — {booking.budget_max?.toLocaleString()}
                  <span className="text-[10px] pb-0.5 opacity-50 font-sans uppercase font-black tracking-widest whitespace-nowrap">PHP Range</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 opacity-40">
                    <Calendar className="h-4 w-4 text-foreground" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground">Deployment Date</span>
                  </div>
                  <p className="text-base font-semibold text-foreground">{eventDateStr}</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 opacity-40">
                    <Clock className="h-4 w-4 text-foreground" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground">Time Framework (Pref)</span>
                  </div>
                  <p className="text-base font-semibold text-foreground uppercase tracking-wider">{booking.event_time_pref || "Flexible"}</p>
                </div>
              </div>

              <div className="space-y-6">
                {dataFields.map((field, i) => (
                  <div key={i} className="flex gap-4">
                    <field.icon className="h-4 w-4 text-primary/60 mt-1 shrink-0 stroke-[1.5]" />
                    <div className="flex-1 space-y-1.5 border-b border-border/10 pb-5">
                      <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">{field.label}</span>
                      <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3 p-5 bg-muted/10 border border-border/10">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                     <AlertTriangle className="h-3 w-3 text-destructive" /> Dietary Vectors & Allergies
                   </Label>
                   <p className="text-xs font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {booking.custom_allergy || [...(booking.allergies || [])].join(', ') || 'No dietary restrictions transmitted.'}
                   </p>
                </div>
                <div className="space-y-3 p-5 bg-muted/10 border border-border/10">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Additional Operational Notes</Label>
                   <p className="text-xs text-muted-foreground font-serif italic leading-relaxed whitespace-pre-wrap">
                      {booking.notes || 'No additional parameters defined.'}
                   </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-border/20 bg-background/60 mt-auto shrink-0 flex flex-col md:flex-row items-center gap-6">
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor="finalizedTime" className="text-[10px] uppercase font-black tracking-widest text-foreground">Define Confirmed Start Time (24h Format)</Label>
                <div className="relative group/input">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/input:text-primary transition-colors" />
                  <Input 
                    id="finalizedTime"
                    type="time" 
                    value={finalizedTime} 
                    onChange={(e) => setFinalizedTime(e.target.value)} 
                    className="h-12 pl-11 rounded-none font-mono text-sm tracking-wider border-border/40 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
              <Button 
                disabled={isProcessing}
                onClick={() => onConfirmAccept(finalizedTime)}
                className="w-full md:w-auto md:h-12 md:px-10 rounded-none bg-primary text-primary-foreground text-[11px] h-14 uppercase tracking-[0.2em] font-black group transition-all duration-300 shrink-0 md:mt-5 shadow-none"
              >
                {isProcessing ? "Transmitting..." : "Secure Mission"}
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}