'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, Trash2, Edit3, 
  CalendarDays, Clock, Users, 
  ChefHat, MessageSquare, Info 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// --- Helper: Universal "N/A" Logic ---
const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return "N/A";
  }
  return value;
};

const DataField = ({ label, value, icon: Icon, fullWidth = false }: { 
  label: string; 
  value: any; 
  icon?: any;
  fullWidth?: boolean 
}) => (
  <div className={cn(
    "py-5 border-b border-border/5 flex flex-col gap-1.5 transition-colors hover:bg-muted/5 px-2 -mx-2", 
    fullWidth ? "col-span-2" : "col-span-1"
  )}>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3 w-3 text-primary/40" />}
      <p className="text-[12px] uppercase font-black text-muted-foreground tracking-[0.2em]">{label}</p>
    </div>
    <p className={cn(
      "text-sm font-serif italic leading-relaxed",
      formatValue(value) === "N/A" ? "text-muted-foreground/30 font-sans not-italic" : "text-foreground"
    )}>
      {formatValue(value)}
    </p>
  </div>
)

const GroupTitle = ({ title, number }: { title: string, number: string }) => (
  <div className="flex items-center gap-4 mb-4 mt-8">
    <span className="text-[10px] font-mono text-primary/30">{number}</span>
    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">{title}</h4>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-border/10 to-transparent" />
  </div>
)

export default function BookingDossierPanel({ booking, onClose, onEdit, onDelete }: { 
  booking: any; 
  onClose: () => void;
  onEdit: (booking: any) => void;
  onDelete: (booking: any) => void;
}) {
  if (!booking) return null;

  const isConsultation = booking.booking_type?.toLowerCase().includes('consultation');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-background/80 backdrop-blur-md" 
        />

        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative h-full w-full md:w-[600px] lg:w-[700px] bg-card border-l border-border/40 shadow-2xl flex flex-col font-sans overflow-hidden"
        >
          {/* Header */}
          <div className={cn(
            "p-10 border-b border-border/10 flex justify-between items-start shrink-0 relative",
            isConsultation ? "bg-indigo-500/5" : "bg-primary/5"
          )}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConsultation ? "bg-indigo-500" : "bg-primary"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  {booking.booking_type || 'Commission'} / {booking.status}
                </span>
              </div>
              <h2 className="text-5xl font-serif italic tracking-tighter leading-[0.9] text-foreground">
                {booking.title || "Untitled Record"}
              </h2>
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-muted transition-colors rounded-full -mt-2">
              <X className="h-6 w-6 stroke-[1.5px]" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12 pb-32">
            
            <section className="flex flex-row items-center justify-start gap-2">
              <Info className="h-4 w-4 text-primary/20 my-auto" />
              <p className="text-xl font-serif italic text-foreground/80 leading-relaxed">
                {booking.description || "No project summary provided."}
              </p>
            </section>

            {/* Section 01: Core Logistics */}
            <section>
              <GroupTitle number="01" title="Logistics & Schedule" />
              <div className="grid grid-cols-2 gap-x-12">
                <DataField icon={CalendarDays} label="Date" value={booking.event_date} />
                <DataField icon={Clock} label="Time Preference" value={booking.event_time_pref || booking.event_time} />
                <DataField icon={Users} label="Volume" value={isConsultation ? "N/A" : (booking.guest_count ? `${booking.guest_count} Pax` : null)} />
                <DataField icon={ChefHat} label="Service Tier" value={booking.service_package} />
                <DataField icon={MapPin} label="Region" value={booking.location_city} />
                <DataField label="Duration" value={booking.duration} />
                <DataField icon={MapPin} label="Exact Coordinates" value={booking.location_address} fullWidth />
              </div>
            </section>

            {/* Section 02: Subject Matter */}
            <section>
              <GroupTitle number="02" title={isConsultation ? "Consultation Scope" : "Culinary Directives"} />
              <div className="grid grid-cols-2 gap-x-12">
                {isConsultation ? (
                  <>
                    <DataField label="Primary Topic" value={booking.consultation_topic || booking.custom_consultation_topic} />
                    <DataField label="Meeting Type" value={booking.consultation_type || booking.custom_consultation_type} />
                  </>
                ) : (
                  <>
                    <DataField label="Theme" value={booking.selected_menu_theme} />
                    <DataField label="Occasion" value={booking.custom_occasion || booking.occasion} />
                  </>
                )}
                
                <DataField icon={MessageSquare} label="Technical Notes" value={booking.notes} fullWidth />
                
                {!isConsultation && (
                  <>
                    <div className="col-span-2 py-6 border-b border-border/5">
                      <p className="text-[12px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-4">Curated Selections</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.menu_selections && booking.menu_selections.length > 0 ? (
                          booking.menu_selections.map((item: string, i: number) => (
                            <span key={i} className="text-[10px] border border-border/40 px-3 py-1.5 uppercase font-bold tracking-tighter bg-card">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30 uppercase font-bold tracking-widest px-2">N/A</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 py-6 border-b border-border/5">
                      <p className="text-[12px] uppercase font-black text-destructive/70 tracking-[0.2em] mb-4">Biological Exclusions</p>
                      <div className="flex flex-wrap gap-2">
                        {((booking.excluded_menu_items?.length || 0) + (booking.custom_allergy ? 1 : 0)) > 0 ? (
                          <>
                            {booking.excluded_menu_items?.map((item: string, i: number) => (
                              <span key={i} className="text-[10px] border border-destructive/20 text-destructive px-3 py-1.5 uppercase font-bold line-through italic">
                                {item}
                              </span>
                            ))}
                            {booking.custom_allergy && (
                              <span className="text-[10px] border border-destructive/30 text-destructive bg-destructive/5 px-3 py-1.5 uppercase font-bold">
                                {booking.custom_allergy}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30 uppercase font-bold tracking-widest px-2">N/A</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Section 03: Budget */}
            <section className="bg-muted/30 p-6 border border-border/10">
              <GroupTitle number="03" title="Fiscal Parameters" />
              <div className="grid grid-cols-2 gap-x-12">
                <DataField label="Min allocation" value={booking.budget_min ? `₱${booking.budget_min.toLocaleString()}` : null} />
                <DataField label="Max allocation" value={booking.budget_max ? `₱${booking.budget_max.toLocaleString()}` : null} />
              </div>
            </section>
          </div>

          {/* Action Bar */}
          <div className="p-8 border-t border-border/10 bg-card/80 backdrop-blur-md flex flex-col sm:flex-row gap-4 shrink-0 absolute bottom-0 w-full">
            <Button 
              variant="destructive" 
              className="flex-1 rounded-none h-14 uppercase text-[10px] font-black tracking-[0.3em]"
              onClick={() => onDelete(booking)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Withdraw Record
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 rounded-none h-14 uppercase text-[10px] font-black tracking-[0.3em] border-border/40"
              onClick={() => onEdit(booking)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Modify commission
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}