"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, ArchiveRestore, Layers } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ArchivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: any[];
  onViewBrief: (booking: any) => void;
}

export default function ArchivePanel({
  isOpen,
  onClose,
  bookings,
  onViewBrief,
}: ArchivePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-md z-[150] transition-all"
          />

          {/* Premium Right Sidebar Drawer Frame */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border/20 z-[160] shadow-[0_0_60px_rgba(0,0,0,0.4)] flex flex-col rounded-none font-sans"
          >
            {/* Structural Drawer Header */}
            <div className="h-20 px-6 border-b border-border/20 flex items-center justify-between shrink-0 bg-background/40">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
                  Ledger Archive
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/60 px-2 py-0.5 border border-border/30 bg-muted/20">
                  {bookings.length} {bookings.length === 1 ? "Node" : "Nodes"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 border border-border/40 hover:border-border/80 transition-colors text-muted-foreground hover:text-foreground bg-background/40 group rounded-none"
              >
                <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
              </button>
            </div>

            {/* Scroll Containment Body Ecosystem */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-4 bg-gradient-to-b from-card to-background/50">
              {bookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/30 bg-muted/5">
                  <ArchiveRestore className="h-5 w-5 text-muted-foreground/40 mb-3 stroke-[1.5]" />
                  <p className="text-xs font-serif italic text-muted-foreground">
                    Historical ledger index is currently empty.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const formattedDate = booking.event_date
                      ? format(parseISO(booking.event_date), "MMM dd, yyyy")
                      : "Date Unspecified";

                    const isPrivateChef = booking.booking_type
                      ?.toLowerCase()
                      .includes("private");

                    return (
                      <motion.div
                        key={booking.id}
                        onClick={() => onViewBrief(booking)}
                        whileHover={{ y: -1 }}
                        className="group relative border border-border/30 hover:border-primary/30 bg-background p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {/* High Contrast Accent Indicator Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-muted-foreground/20 group-hover:bg-primary transition-colors" />

                        <div className="flex flex-col gap-2.5 pl-1">
                          {/* Modality Pill Rows */}
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-none",
                                isPrivateChef
                                  ? "bg-primary/5 text-primary border-primary/20"
                                  : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                              )}
                            >
                              {isPrivateChef ? "Private Chef" : "Consultation"}
                            </span>
                            <span className="text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                              ID: {booking.id.slice(0, 6)}
                            </span>
                          </div>

                          {/* Dynamic Ledger Document Identification Title */}
                          <h4 className="text-sm font-medium tracking-tight text-foreground/90 group-hover:text-primary transition-colors pr-4 line-clamp-1">
                            {booking.title || "Untitled Commission"}
                          </h4>

                          {/* Secondary Structural Context Items */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground/70 font-sans mt-0.5 border-t border-border/10 pt-2.5">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <Calendar className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                            {booking.location_city && (
                              <div className="flex items-center gap-1.5 max-w-[180px]">
                                <MapPin className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                <span className="truncate">
                                  {booking.location_city}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Micro Structural Drawer Status Footer Banner */}
            <div className="h-12 px-6 border-t border-border/20 bg-background/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50">
                <Layers className="h-3 w-3 stroke-[1.5]" /> Securing Archival Matrix
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}