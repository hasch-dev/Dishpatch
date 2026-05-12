"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Users, MapPin, PhilippinePeso, 
  ArrowRight, Search, Filter, CheckCircle2,
  Clock, Utensils, Info, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "sonner"; // Assuming you use sonner or a similar toast lib

export default function ChefRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [chefId, setChefId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getChef = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");
      setChefId(user.id);
      fetchOpenRequests();
    };
    getChef();
  }, []);

  const fetchOpenRequests = async () => {
    setLoading(true);
    // Only fetch bookings that are 'open' and haven't been assigned
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "open")
      .is("chef_id", null)
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!chefId) return;
    
    setIsAccepting(bookingId);
    
    // Update the booking: Assign this chef and change status
    const { error } = await supabase
      .from("bookings")
      .update({ 
        chef_id: chefId,
        status: 'assigned' 
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Acceptance Error:", error);
      toast.error("Failed to accept booking.");
      setIsAccepting(null);
    } else {
      toast.success("Commission Accepted!");
      // Remove from local list and redirect to the dashboard or deal page
      setRequests(prev => prev.filter(r => r.id !== bookingId));
      setIsAccepting(null);
      router.push("/dashboard"); 
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-[10px] tracking-[0.5em] animate-pulse uppercase italic">Scanning_Marketplace</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 pb-20">
      {/* HEADER */}
      <header className="px-8 py-12 max-w-7xl mx-auto border-b border-border/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 opacity-40 mb-4">
              <div className="h-[1px] w-6 bg-foreground" />
              <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Available Commissions</p>
            </div>
            <h1 className="text-5xl font-serif italic tracking-tighter leading-none">The Marketplace</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <Badge variant="outline" className="rounded-none px-4 py-1 text-[10px] font-mono border-primary/20 text-primary uppercase tracking-widest">
                {requests.length} Open Requests
             </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-2xl">
            <Info className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
            <p className="font-serif italic text-muted-foreground text-xl">No active requests found at this moment.</p>
            <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {requests.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group relative bg-card border-border/40 hover:border-primary/40 transition-all duration-500 rounded-none overflow-hidden h-full flex flex-col">
                    {/* TYPE OVERLAY */}
                    <div className="absolute top-0 right-0 p-4">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                            {booking.booking_type || "Standard"}
                        </span>
                    </div>

                    <CardContent className="p-8 flex-grow">
                      <div className="space-y-6">
                        {/* Title & Occasion */}
                        <div>
                          <h3 className="text-2xl font-serif italic mb-1 truncate">
                            {booking.title || "New Commission Request"}
                          </h3>
                          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground italic">
                            {booking.occasion || "Special Event"}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 border-y border-border/10 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className="text-[9px] uppercase font-bold tracking-widest">Date</span>
                            </div>
                            <p className="text-xs font-medium">
                              {booking.event_date ? format(parseISO(booking.event_date), 'MMM dd, yyyy') : 'Flexible'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span className="text-[9px] uppercase font-bold tracking-widest">Guests</span>
                            </div>
                            <p className="text-xs font-medium">{booking.guest_count || 0} Pax</p>
                          </div>
                        </div>

                        {/* Location & Budget */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                                <div className="text-xs leading-relaxed opacity-80 italic">
                                    {booking.location_city || booking.location_address || "Location TBD"}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <PhilippinePeso className="h-3.5 w-3.5 text-primary mt-0.5" />
                                <div className="text-xs font-mono font-bold tracking-tight">
                                    {booking.budget_min?.toLocaleString()} - {booking.budget_max?.toLocaleString()}
                                    <span className="text-[9px] ml-1 opacity-40 font-sans">PHP</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-3">
                            "{booking.description || "No additional details provided by the client."}"
                        </p>
                      </div>
                    </CardContent>

                    <div className="p-4 bg-muted/30 border-t border-border/10 grid grid-cols-2 gap-4">
                       <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/booking/${booking.id}`)}
                        className="rounded-none text-[9px] uppercase tracking-[0.2em] font-bold h-10 hover:bg-background"
                       >
                         View Details
                       </Button>
                       <Button 
                        size="sm"
                        disabled={isAccepting === booking.id}
                        onClick={() => handleAcceptBooking(booking.id)}
                        className="rounded-none bg-primary text-primary-foreground text-[9px] uppercase tracking-[0.2em] font-bold h-10 group"
                       >
                         {isAccepting === booking.id ? (
                           <div className="h-3 w-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                         ) : (
                           <>
                            Accept <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                           </>
                         )}
                       </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}