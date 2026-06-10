"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Calendar, MapPin, PhilippinePeso, Clock, AlertTriangle, 
  ArrowRight, Layers, Users, Building2, Target, FileText, UtensilsCrossed,
  UserCircle, Phone, BookOpen
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BookingReviewModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAccept: (finalizedTime: string) => void;
  isProcessing: boolean;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function BookingReviewModal({
  booking,
  isOpen,
  onClose,
  onConfirmAccept,
  isProcessing,
}: BookingReviewModalProps) {

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!booking) return null;

  const isConsultation = booking.booking_type?.toLowerCase().includes("consultation");
  const eventDateStr = booking.event_date ? format(parseISO(booking.event_date), "MMMM dd, yyyy") : "TBD";
  const endDateStr = booking.event_end_date ? format(parseISO(booking.event_end_date), "MMM dd, yyyy") : null;
  
  const budgetMin = booking.budget_min?.toLocaleString() || "0";
  const budgetMax = booking.budget_max?.toLocaleString() || "0";
  const isFlexible = booking.budget_flexible;

  const renderArray = (arr: any) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
    return arr.join(", ");
  };

  // Safe renderer for JSONB arrays (menu_selections, catalog_selections)
  const renderJsonbList = (data: any) => {
    if (!data) return null;
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (typeof data === 'object') arr = Object.values(data);
    
    if (arr.length === 0) return null;

    return (
      <ul className="list-disc pl-4 space-y-1 mt-2 text-[13px] text-foreground/80 font-serif italic">
        {arr.map((item: any, i: number) => {
          if (typeof item === 'string') return <li key={i}>{item}</li>;
          if (item.name) return <li key={i}>{item.name} {item.quantity ? `(x${item.quantity})` : ''}</li>;
          if (item.title) return <li key={i}>{item.title}</li>;
          return null;
        }).filter(Boolean)}
      </ul>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6 font-sans">
          
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-background border border-border/40 shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col rounded-none overflow-hidden max-h-[92vh]"
          >
            {/* --- DECORATIVE UI ELEMENTS --- */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 z-10" />
            <div className="absolute top-2 left-2 text-border/40 font-mono text-[8px]">+</div>
            <div className="absolute top-2 right-2 text-border/40 font-mono text-[8px]">+</div>
            
            {/* Header: Title & Financials */}
            <div className="flex-shrink-0 relative overflow-hidden bg-muted/5 border-b border-border/20 p-6 md:p-10">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              <div className="relative z-10 flex justify-between items-start mb-8 pr-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1 border rounded-none shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.05)]",
                      isConsultation ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : "border-primary/30 text-primary bg-primary/10"
                    )}>
                      {isConsultation ? "Consultation" : "Private Event"}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70 uppercase">
                      <span className="w-4 h-[1px] bg-muted-foreground/40" />
                      Ref: {booking.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter text-foreground leading-none">
                    {booking.title || "Untitled Commission"}
                  </h2>
                </div>
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-background border border-border/30 hover:border-foreground/40 hover:bg-muted/50 rounded-none transition-all text-muted-foreground hover:text-foreground group z-20">
                  <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
                </button>
              </div>

              {/* Financial & Client Ledger Block */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-background/60 backdrop-blur-md p-4 md:px-6 border border-border/30 shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/80" />
                
                {/* Finance */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 text-primary">
                      <PhilippinePeso className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="text-2xl font-mono font-medium tracking-tight text-foreground">
                      {budgetMin} <span className="text-muted-foreground/40 font-light mx-1">—</span> {budgetMax}
                    </div>
                  </div>
                  {isFlexible && (
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary/80 bg-primary/5 px-2.5 py-1 border border-primary/20">
                      Budget Flexible
                    </span>
                  )}
                </div>

                {/* Client Quick Info */}
                <div className="flex items-center gap-4 border-t border-border/20 md:border-t-0 md:border-l md:border-border/40 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    {booking.recipient_name || "Unknown Identity"}
                  </div>
                  {booking.phone_number && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Phone className="h-3.5 w-3.5" />
                      {booking.phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-background no-scrollbar">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-10"
              >
                
                {/* Primary Logistics Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-border/10">
                  <div className="space-y-2.5 group">
                    <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary/50 transition-colors group-hover:text-primary" /> Date Matrix
                    </Label>
                    <p className="text-sm font-medium text-foreground/90">
                      {eventDateStr} 
                      {endDateStr && <span className="opacity-50 text-[11px] font-mono block mt-1">to {endDateStr}</span>}
                    </p>
                  </div>
                  
                  <div className="space-y-2.5 group">
                    <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary/50 transition-colors group-hover:text-primary" /> Timing & Span
                    </Label>
                    <p className="text-sm font-medium text-foreground/90 uppercase">
                      {booking.event_time_pref || "TBD"}
                      {booking.duration && <span className="opacity-50 text-[11px] font-mono block mt-1 normal-case">Est: {booking.duration}</span>}
                    </p>
                  </div>

                  <div className="space-y-2.5 group">
                    <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-primary/50 transition-colors group-hover:text-primary" /> Pax / Scale
                    </Label>
                    <p className="text-sm font-medium text-foreground/90">
                      {booking.guest_count || booking.company_employee_count || "—"}
                    </p>
                  </div>

                  <div className="space-y-2.5 group">
                    <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary/50 transition-colors group-hover:text-primary" /> Coordinates
                    </Label>
                    <p className="text-sm font-medium text-foreground/90 truncate">
                      {booking.location_city || "TBD"}
                      {booking.location_address && (
                        <span className="opacity-50 text-[11px] block mt-1 truncate" title={booking.location_address}>
                          {booking.location_address}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>

                {/* Dynamic Context Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  
                  {/* LEFT COLUMN */}
                  <motion.div variants={containerVariants} className="space-y-8">
                    {isConsultation ? (
                      <>
                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                            <Building2 className="h-3.5 w-3.5 text-primary/60" /> Entity Profile
                          </Label>
                          <div className="p-5 bg-muted/10 border border-border/20 hover:border-border/40 transition-colors">
                            <p className="text-[15px] font-serif italic text-foreground/90 mb-1 flex flex-wrap gap-x-2">
                              {booking.company_name || "Unknown Entity"} 
                              <span className="text-xs font-sans not-italic text-muted-foreground">({booking.business_stage || "Stage Unspecified"})</span>
                            </p>
                            {booking.company_location && (
                              <p className="text-[11px] text-muted-foreground font-mono mt-1">HQ: {booking.company_location}</p>
                            )}
                            {booking.company_introduction && (
                              <p className="text-xs text-muted-foreground mt-4 leading-relaxed border-l-[1.5px] border-primary/30 pl-3">
                                {booking.company_introduction}
                              </p>
                            )}
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                            <Layers className="h-3.5 w-3.5 text-primary/60" /> Engagement Scope
                          </Label>
                          <div className="p-4 border border-dashed border-border/30 bg-muted/5">
                            <p className="text-sm font-medium text-foreground/90">
                              {booking.consultation_package || "Custom Engagement"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 font-mono uppercase tracking-wider">
                              Format: <span className="text-foreground/70">{booking.custom_consultation_type || booking.consultation_type || booking.delivery_format || "TBD"}</span>
                            </p>
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                            <Target className="h-3.5 w-3.5 text-primary/60" /> Event Vector
                          </Label>
                          <p className="text-base font-serif italic text-foreground/90 p-4 bg-muted/10 border border-border/20">
                            {booking.custom_occasion || booking.occasion || "General Dining"}
                          </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                            <UtensilsCrossed className="h-3.5 w-3.5 text-primary/60" /> Culinary Framework
                          </Label>
                          <div className="p-5 border border-dashed border-border/30 bg-muted/5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Theme</span>
                                <p className="text-sm font-medium text-foreground/90">{booking.selected_menu_theme || "TBD"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Package</span>
                                <p className="text-sm font-medium text-foreground/90">{booking.service_package || "Standard"}</p>
                              </div>
                            </div>
                            
                            {/* JSONB Catalog/Menu Selections */}
                            {(booking.menu_selections || booking.catalog_selections) && (
                              <div className="pt-3 border-t border-border/30">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1 flex items-center gap-1.5">
                                  <BookOpen className="h-3 w-3" /> Pre-Selected Catalog Items
                                </span>
                                {renderJsonbList(booking.menu_selections || booking.catalog_selections)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}

                    {booking.custom_menu && (
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                          <FileText className="h-3.5 w-3.5 text-primary/60" /> Custom Menu Directive
                        </Label>
                        <div className="p-5 bg-muted/10 border border-border/20">
                          <p className="text-[13px] text-foreground/80 leading-relaxed font-serif italic">
                            "{booking.custom_menu}"
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {(booking.description || booking.notes) && (
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2 mb-3">
                          <FileText className="h-3.5 w-3.5 text-foreground/40" /> Additional Directives
                        </Label>
                        <div className="p-5 bg-muted/20 border border-border/20 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-foreground/10" />
                          <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-serif italic">
                            "{booking.description || booking.notes}"
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* RIGHT COLUMN */}
                  <motion.div variants={containerVariants} className="space-y-8">
                    {isConsultation ? (
                      <>
                        <motion.div variants={itemVariants} className="space-y-2">
                          <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 mb-3 block">
                            Strategic Objectives
                          </Label>
                          <div className="p-5 bg-background border border-border/30 shadow-sm">
                            <p className="text-sm font-medium text-foreground">
                              {booking.custom_consultation_topic || booking.consultation_topic || booking.primary_objective || "General Consultation"}
                            </p>
                            {booking.objective_explanation && (
                              <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap border-t border-border/20 pt-3">
                                {booking.objective_explanation}
                              </p>
                            )}
                          </div>
                        </motion.div>
                        
                        {booking.areas_of_focus && booking.areas_of_focus.length > 0 && (
                          <motion.div variants={itemVariants} className="space-y-2">
                             <Label className="text-[9px] uppercase font-black tracking-[0.15em] text-muted-foreground/70 mb-3 block">
                               Focus Areas
                             </Label>
                             <div className="flex flex-wrap gap-2">
                               {booking.areas_of_focus.map((area: string, idx: number) => (
                                 <span key={idx} className="text-[10px] font-mono px-2.5 py-1.5 bg-muted/30 border border-border/40 text-foreground/80 hover:bg-muted/50 transition-colors">
                                   {area}
                                 </span>
                               ))}
                             </div>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <>
                        <motion.div variants={itemVariants}>
                          <div className="relative p-6 bg-destructive/5 border border-destructive/20 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                            
                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-destructive flex items-center gap-2 mb-4 relative z-10">
                              <AlertTriangle className="h-4 w-4" /> Dietary Constraints
                            </Label>
                            
                            <div className="space-y-4 relative z-10">
                              <div>
                                <span className="text-[9px] text-destructive/60 uppercase font-bold block mb-1">Declared Allergies</span>
                                <p className="text-[14px] font-medium text-destructive/90 leading-relaxed">
                                  {booking.custom_allergy || renderArray(booking.allergies) || 'No restrictions logged.'}
                                </p>
                              </div>

                              {booking.excluded_menu_items && booking.excluded_menu_items.length > 0 && (
                                <div className="pt-4 border-t border-destructive/10">
                                  <span className="text-[9px] text-destructive/60 uppercase font-bold block mb-1">Excluded Ingredients</span>
                                  <p className="text-[13px] text-destructive/80 font-serif italic">
                                    {renderArray(booking.excluded_menu_items)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </motion.div>

                </div>
              </motion.div>
            </div>

            {/* Finalization Action Footer */}
            <div className="p-6 md:px-10 border-t border-border/20 bg-muted/10 shrink-0 flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent pointer-events-none" />
              
              <div className="space-y-1.5 w-full sm:w-auto text-center sm:text-left relative z-10">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/80 flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Direct Communication Phase
                </p>
                <p className="text-xs text-muted-foreground font-serif italic">
                  Exact execution timing and logistics will be coordinated directly with the client.
                </p>
              </div>
              
              <Button 
                disabled={isProcessing}
                onClick={() => onConfirmAccept(booking.event_time_pref || "TBD")}
                className="w-full sm:w-auto h-12 px-10 rounded-none bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-black group transition-all duration-500 hover:bg-primary/90 shadow-[0_0_0_rgba(var(--primary),0)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] relative z-10 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  {isProcessing ? "Transmitting..." : "Secure Mission & Connect"}
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}