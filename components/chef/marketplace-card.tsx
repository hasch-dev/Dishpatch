"use client";

import { Calendar, Users, MapPin, PhilippinePeso, MessageSquare, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface MarketplaceCardProps {
  booking: any;
  variant: "marketplace" | "active";
  viewMode?: 'grid' | 'list';
  onPrimaryAction: () => void;
  isProcessing: boolean;
}

export default function MarketplaceCard({ 
  booking, 
  variant, 
  viewMode = 'list',
  onPrimaryAction, 
  isProcessing 
}: MarketplaceCardProps) {
  const isConsultation = booking.booking_type?.toLowerCase().includes("consultation");
  
  const formatBudget = (val: number | null) => {
    if (!val) return "TBD";
    if (viewMode === 'grid') return `${(val/1000)}k`;
    return val.toLocaleString();
  };

  const formattedDate = booking.event_date ? format(parseISO(booking.event_date), 'MMM dd, yyyy') : 'Date TBD';

  return (
    <div className={cn("w-full h-full", viewMode === 'grid' && "aspect-auto")}>
      <div className={cn(
        "group relative border border-border/30 hover:border-primary/40 bg-card/60 backdrop-blur-sm flex transition-colors duration-200 rounded-none shadow-sm font-sans h-full",
        viewMode === 'list' ? "p-4 md:p-5 flex-col md:flex-row items-start md:items-center justify-between gap-4" : "p-6 flex-col gap-5 justify-between"
      )}>
        
        {/* High Contrast Status Line Accent */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px] transition-colors",
          variant === "active" ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-primary/50"
        )} />

        {/* Primary Data Cluster */}
        <div className={cn("min-w-0 pl-2 flex-1", viewMode === 'list' ? "space-y-2" : "space-y-3 pr-16")}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-none shrink-0",
              isConsultation ? "border-amber-500/20 text-amber-500 bg-amber-500/5" : "border-primary/20 text-primary bg-primary/5"
            )}>
              {isConsultation ? "Consultation" : "Private Chef"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              #{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className={cn(
              "font-medium text-foreground tracking-tight group-hover:text-primary transition-colors",
              viewMode === 'list' ? "text-base md:text-lg truncate" : "text-xl line-clamp-2 leading-tight"
            )}>
              {booking.title || "Untitled Commission"}
            </h3>
            
            {/* Added Client Name Display */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
              Client: <span className="text-foreground/90">{booking.recipient_name || "Unknown Operator"}</span>
            </p>
          </div>

          <div className={cn(
            "flex flex-wrap items-center gap-y-1.5 text-xs text-muted-foreground font-sans pt-1",
            viewMode === 'list' ? "gap-x-4" : "gap-x-5"
          )}>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Users className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <span>{booking.guest_count || "—"} Pax</span>
            </div>
            <div className={cn("flex items-center gap-1.5", viewMode === 'list' ? "max-w-[200px]" : "max-w-[150px]")}>
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <span className="truncate">{booking.location_city || "Confidential"}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-foreground/90 bg-muted/30 px-2 py-0.5 border border-border/40 whitespace-nowrap">
              <PhilippinePeso className="h-3 w-3 text-primary/70 shrink-0" />
              <span>
                {formatBudget(booking.budget_min)} — {formatBudget(booking.budget_max)}
                {viewMode === 'list' && <span className="text-[9px] ml-1.5 font-sans opacity-40">PHP</span>}
              </span>
            </div>
          </div>
        </div>

        <div className={cn("shrink-0 pl-2 md:pl-0", viewMode === 'list' ? "w-full md:w-auto" : "w-full pt-2")}>
          {variant === "marketplace" ? (
            <Button 
              disabled={isProcessing}
              onClick={onPrimaryAction}
              className={cn(
                "rounded-none bg-primary text-primary-foreground text-[10px] h-10 uppercase tracking-widest font-black group shadow-none hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-200",
                viewMode === 'list' ? "w-full md:w-48" : "w-full"
              )}
            >
              {isProcessing ? "Routing..." : "Review & Secure"}
              <ClipboardCheck className="ml-2.5 h-4 w-4 opacity-80" />
            </Button>
          ) : (
            <Button 
              disabled={isProcessing}
              onClick={onPrimaryAction}
              className={cn(
                "rounded-none bg-foreground text-background hover:bg-foreground/90 text-[10px] h-10 uppercase tracking-widest font-black group transition-colors duration-200",
                viewMode === 'list' ? "w-full md:w-48" : "w-full"
              )}
            >
              {isProcessing ? "Routing..." : "Open Dialogue"}
              <MessageSquare className="ml-2.5 h-3.5 w-3.5 opacity-80" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}