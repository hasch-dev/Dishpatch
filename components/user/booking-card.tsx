"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, UserSquare2, ArrowRight, History, Archive, Edit3, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BookingCardProps {
  booking: any;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onPurge: (e: React.MouseEvent) => void; // Keeps compatibility with parent dashboard
}

export default function BookingCard({ booking, onSelect, onEdit, onPurge }: BookingCardProps) {
  const isExpired = booking.status === 'expired';
  const isLocked = ['completed', 'cancelled'].includes(booking.status);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpired && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!isExpired ? { y: -4 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => !isExpired && onSelect()}
      onKeyDown={handleKeyDown}
      role={isExpired ? "article" : "button"}
      tabIndex={isExpired ? -1 : 0}
      aria-disabled={isExpired}
      className={cn(
        "group bg-card border border-border/50 rounded-xl p-5 md:p-6 flex flex-col justify-between relative overflow-hidden transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isExpired ? "cursor-default bg-muted/30" : "cursor-pointer hover:border-primary/40 hover:shadow-lg shadow-sm",
        isLocked && "opacity-60"
      )}
    >
      {/* Expired Overlay */}
      <AnimatePresence>
        {isExpired && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center"
          >
            <div className="bg-card border border-border/50 rounded-xl p-5 flex flex-col items-center max-w-[260px] shadow-xl">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">Reservation Expired</h4>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                This request has expired. Move it to your archive to clear up your dashboard.
              </p>
              <Button 
                variant="outline"
                onClick={onPurge}
                className="w-full h-9 text-xs rounded-full hover:bg-muted"
              >
                <Archive className="h-4 w-4 mr-2" /> Archive Booking
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Actions */}
      {!isExpired && !isLocked && (
        <div className="absolute right-4 top-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary" size="icon"
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="h-8 w-8 rounded-full shadow-sm text-foreground hover:text-primary bg-background border border-border/50"
            title="Edit Booking"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary" size="icon"
            onClick={(e) => { e.stopPropagation(); onPurge(e); }}
            className="h-8 w-8 rounded-full shadow-sm text-foreground hover:text-red-500 bg-background border border-border/50"
            title="Archive Booking"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={cn("flex flex-col h-full w-full", isExpired && "opacity-40 pointer-events-none")}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider",
            ['confirmed', 'assigned'].includes(booking.status)
              ? "bg-emerald-500/10 text-emerald-600" 
              : "bg-primary/10 text-primary",
          )}>
            {booking.status.replace(/_/g, ' ')}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-primary group-hover:translate-x-1" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-serif italic tracking-tight line-clamp-1 mb-2 text-foreground group-hover:text-primary transition-colors">
            {booking.title || "Untitled Booking"}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">
              {booking.event_date ? format(parseISO(booking.event_date), 'MMMM dd, yyyy') : 'Date TBD'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-5 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2 w-full">
            {booking.artisan ? (
              <div className="flex items-center gap-2 min-w-0 bg-muted/50 px-2 py-1 rounded-md">
                <UserSquare2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{booking.artisan.display_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                {booking.edit_count >= 2 ? (
                  <Lock className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                )}
                <span className="text-xs font-medium">
                  {booking.edit_count || 0}/2 Revisions Used
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}