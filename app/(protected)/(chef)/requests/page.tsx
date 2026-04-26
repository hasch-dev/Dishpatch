"use client";

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Users, Calendar, Clock,
  ChevronRight, CheckCircle2, Info, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [availableBookings, setAvailableBookings] = useState<any[]>([]); // To be claimed
  const [myBookings, setMyBookings] = useState<any[]>([]); // Already claimed
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    // 1. Load Available (Pending Assignment & No Chef)
    const availableReq = supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending_assignment")
      .is("chef_id", null);

    // 2. Load My Current Requests (Already Claimed by this Chef)
    const myReq = supabase
      .from("bookings")
      .select("*")
      .eq("chef_id", user.id);

    const [resAvailable, resMy] = await Promise.all([availableReq, myReq]);

    if (resAvailable.data) setAvailableBookings(resAvailable.data);
    if (resMy.data) setMyBookings(resMy.data);
    
    setLoading(false);
  };

  const handleClaim = async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("bookings")
      .update({ chef_id: user.id, status: "assigned" })
      .eq("id", bookingId);

    if (!error) {
      // Optimistic Update: Move from available to myBookings
      const claimed = availableBookings.find(b => b.id === bookingId);
      setAvailableBookings(prev => prev.filter(b => b.id !== bookingId));
      setMyBookings(prev => [{ ...claimed, chef_id: user.id, status: 'assigned' }, ...prev]);

      setMessage({ text: "Experience successfully claimed!", type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const filteredAvailable = availableBookings.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      
      {/* ANIMATED TOAST */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border",
              message.type === 'success' ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-5xl font-serif italic text-foreground tracking-tight">Requests</h1>
          <p className="text-muted-foreground mt-3 font-light italic">Browse available assignments or manage your ongoing consultations.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by title or client..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-full bg-muted/20 border-border focus:ring-primary"
          />
        </div>
      </header>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-14 p-0 gap-10">
          <TabsTrigger value="available" className="request-tab">
            Available to Claim ({availableBookings.length})
          </TabsTrigger>
          <TabsTrigger value="my-jobs" className="request-tab">
            Assigned to Me ({myBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="pt-8">
          <div className="grid gap-6">
            {filteredAvailable.length === 0 ? (
              <EmptyState message="No available requests at the moment." />
            ) : (
              filteredAvailable.map((b) => (
                <BookingCard key={b.id} booking={b} onAction={() => handleClaim(b.id)} actionText="Accept Booking" />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-jobs" className="pt-8">
          <div className="grid gap-6">
            {myBookings.length === 0 ? (
              <EmptyState message="You haven't claimed any bookings yet." />
            ) : (
              myBookings.map((b) => (
                <BookingCard key={b.id} booking={b} isAssigned />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

function BookingCard({ booking, onAction, actionText, isAssigned = false }: any) {
  let parsed: any = {};
  try { parsed = JSON.parse(booking.notes || "{}"); } catch {}

  return (
    <Card className="group border-border hover:border-primary/40 transition-all bg-card overflow-hidden shadow-sm hover:shadow-md">
      <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
        <div className="p-8 flex-1 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] font-bold py-1 px-3 bg-primary/10 text-primary rounded-full uppercase tracking-[0.2em]">
                  {parsed.type || "Private Dinner"}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {booking.event_time || "Morning"}
                </span>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter group-hover:text-primary transition-colors">
                {booking.title}
              </h3>
            </div>
            {!isAssigned && (
               <Button onClick={onAction} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-widest h-11">
                {actionText}
               </Button>
            )}
            {isAssigned && (
              <Link href={`/booking/${booking.id}`}>
                <Button variant="outline" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Manage <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoItem icon={<Calendar className="h-4 w-4" />} label="Date" value={booking.event_date} />
            <InfoItem icon={<MapPin className="h-4 w-4" />} label="Location" value={parsed.location || "Silang, Cavite"} />
            <InfoItem icon={<Users className="h-4 w-4" />} label="Guests" value={parsed.guestRange ? `${parsed.guestRange.min}-${parsed.guestRange.max}` : "TBD"} />
            <InfoItem icon={<Info className="h-4 w-4" />} label="Status" value={booking.status} highlight />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value, highlight = false }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={cn("text-xs font-medium italic font-serif", highlight ? "text-primary" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24 border-2 border-dashed border-border rounded-[2rem] bg-card/20">
      <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground italic font-light font-serif text-lg">{message}</p>
    </div>
  );
}

import "./requests.css"; // Make sure to add the tab styles below
import Link from "next/link";