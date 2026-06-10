"use client";

import { motion } from "framer-motion";
import { X, Edit3, Archive, MapPin, Users, Briefcase, FileText, Banknote, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DossierProps {
  booking: any;
  onClose: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void; // Mapped to Archive action
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function BookingDossierPanel({ booking, onClose, onEdit, onDelete }: DossierProps) {
  const isConsultation = booking.booking_type === 'Consultation';
  const isLocked = ['completed', 'cancelled', 'expired'].includes(booking.status) || booking.client_purged;

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h3>
    </div>
  );

  const DataPoint = ({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) => (
    <div className={cn("mb-4 rounded-lg", highlight && "p-3 bg-primary/5 border border-primary/10")}>
      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <div className="text-sm text-foreground font-medium">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl h-full md:h-auto max-h-[100vh] md:max-h-[90vh] bg-card md:rounded-2xl border border-border/50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 p-6 md:p-8 border-b border-border/40 bg-background/95 backdrop-blur-md flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-widest">
              {booking.status.replace(/_/g, ' ')}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-3xl font-serif italic tracking-tight text-foreground mb-3">
            {booking.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <CalendarDays className="h-4 w-4" />
              <span>{booking.booking_type}</span>
            </div>
            <span className="opacity-40">•</span>
            <span>Requested on {format(parseISO(booking.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <motion.div 
          variants={containerVariants} initial="hidden" animate="visible"
          className="p-6 md:p-8 flex-1 overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                {isConsultation ? (
                  <>
                    <SectionHeader icon={Briefcase} title="Corporate Details" />
                    <DataPoint label="Company Name" value={booking.company_name} highlight />
                    <DataPoint label="Primary Contact" value={booking.recipient_name} />
                    <div className="grid grid-cols-2 gap-4">
                      <DataPoint label="Phone" value={booking.phone_number} />
                      <DataPoint label="Company Size" value={`${booking.company_employee_count} Employees`} />
                    </div>
                  </>
                ) : (
                  <>
                    <SectionHeader icon={Users} title="Client Details" />
                    <DataPoint label="Host Name" value={booking.recipient_name} highlight />
                    <DataPoint label="Phone Number" value={booking.phone_number} />
                    <DataPoint label="Occasion" value={booking.occasion === 'Other' ? booking.custom_occasion : booking.occasion} />
                  </>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <SectionHeader icon={MapPin} title="Logistics" />
                {isConsultation ? (
                  <>
                    <DataPoint label="Location" value={booking.company_location || booking.location_city} />
                    <DataPoint label="Format" value={booking.delivery_format?.replace(/_/g, ' ')} />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <DataPoint label="Date" value={booking.event_date ? format(parseISO(booking.event_date), 'MMM dd, yyyy') : null} />
                      <DataPoint label="Time Preference" value={booking.event_time_pref} />
                    </div>
                    <DataPoint label="Address" value={`${booking.location_address}${booking.location_city ? `, ${booking.location_city}` : ''}`} />
                  </>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                <SectionHeader icon={FileText} title="Service Details" />
                {isConsultation ? (
                  <>
                    <DataPoint label="Business Stage" value={booking.business_stage} />
                    <DataPoint label="Objective" value={booking.primary_objective} />
                    <DataPoint label="Topic" value={booking.consultation_topic === 'custom' ? booking.custom_consultation_topic : booking.consultation_topic} />
                    <div className="mt-4">
                      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Focus Areas</span>
                      <div className="flex flex-wrap gap-2">
                        {booking.areas_of_focus?.map((area: string, i: number) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full bg-muted font-medium">{area}</span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <DataPoint label="Guest Count" value={booking.guest_count ? `${booking.guest_count} Guests` : null} highlight />
                      <DataPoint label="Package Tier" value={booking.service_package} />
                    </div>
                    <DataPoint label="Menu Theme" value={booking.selected_menu_theme} />
                    <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                      <span className="block text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Dietary Restrictions</span>
                      <p className="text-sm font-medium text-foreground">
                        {[...(booking.allergies || []), booking.custom_allergy].filter(Boolean).join(', ') || 'None reported'}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <SectionHeader icon={Banknote} title="Financials" />
                <div className="grid grid-cols-2 gap-4">
                  {booking.finalized_price ? (
                    <DataPoint label="Agreed Price" value={`₱${booking.finalized_price.toLocaleString()}`} highlight />
                  ) : (
                    <DataPoint label="Budget Range" value={booking.budget_min ? `₱${booking.budget_min.toLocaleString()} - ₱${booking.budget_max?.toLocaleString()}` : 'TBD'} highlight />
                  )}
                  <DataPoint label="Payment Status" value={booking.payment_status?.replace('_', ' ')} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <motion.div variants={itemVariants} className="mt-8 p-5 bg-muted/50 rounded-xl border border-border/40">
              <SectionHeader icon={FileText} title="Client Notes" />
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {booking.notes}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="p-6 border-t border-border/40 bg-card flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground font-medium">
            Revisions left: <span className="text-primary font-bold">{Math.max(0, 2 - (booking.edit_count || 0))}</span>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button 
              variant="outline" 
              onClick={onDelete}
              className="flex-1 sm:flex-none hover:bg-muted rounded-full"
            >
              <Archive className="h-4 w-4 mr-2" /> Archive
            </Button>
            <Button 
              onClick={onEdit}
              disabled={isLocked || booking.edit_count >= 2}
              className="flex-1 sm:flex-none rounded-full"
            >
              <Edit3 className="h-4 w-4 mr-2" /> Modify Request
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}