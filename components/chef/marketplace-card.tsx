"use client";

import { Calendar, Users, MapPin, PhilippinePeso, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface MarketplaceCardProps {
  booking: any;
  onAccept: () => void;
  isAccepting: boolean;
}

export default function MarketplaceCard({ booking, onAccept, isAccepting }: MarketplaceCardProps) {
  const isConsultation = booking.booking_type?.includes("Consultation");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="group relative bg-card border-border/40 hover:border-primary/40 transition-all duration-500 rounded-none overflow-hidden h-full flex flex-col shadow-none">
        <div className="absolute top-0 right-0 p-6">
          <span className={cn(
            "text-[7px] font-black uppercase tracking-[0.3em] px-2 py-1 border transition-colors",
            isConsultation ? "border-blue-500/20 text-blue-500" : "border-primary/20 text-primary"
          )}>
            {booking.booking_type || "Standard"}
          </span>
        </div>

        <CardContent className="p-10 flex-grow">
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-serif italic mb-2 tracking-tight group-hover:text-primary transition-colors">
                {booking.title || "Untitled Request"}
              </h3>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 italic">
                {booking.occasion || booking.service_package || "General Assignment"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y border-border/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-30">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[8px] uppercase font-bold tracking-widest">Deployment</span>
                </div>
                <p className="text-xs font-medium">
                  {booking.event_date ? format(parseISO(booking.event_date), 'MMM dd, yyyy') : 'Schedule TBD'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-30">
                  <Users className="h-3 w-3" />
                  <span className="text-[8px] uppercase font-bold tracking-widest">Intelligence</span>
                </div>
                <p className="text-xs font-medium">{booking.guest_count || "N/A"} Participants</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 group/item">
                <MapPin className="h-3.5 w-3.5 text-primary/40 mt-0.5" />
                <span className="text-[11px] leading-relaxed italic text-muted-foreground">
                  {booking.location_city || "Confidential Location"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <PhilippinePeso className="h-3.5 w-3.5 text-primary mt-0.5" />
                <div className="text-sm font-mono font-bold">
                  {booking.budget_min?.toLocaleString()} — {booking.budget_max?.toLocaleString()}
                  <span className="text-[9px] ml-2 opacity-30 font-sans uppercase tracking-tighter">PHP Range</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="px-10 pb-10 grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="rounded-none text-[9px] h-12 uppercase tracking-widest font-black border-border/40 hover:bg-muted"
            asChild
          >
            <a href={`/booking/${booking.id}`}>Briefing</a>
          </Button>
          <Button 
            disabled={isAccepting}
            onClick={onAccept}
            className="rounded-none bg-primary text-primary-foreground text-[9px] h-12 uppercase tracking-widest font-black group shadow-xl"
          >
            {isAccepting ? "Securing..." : "Accept"}
            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}