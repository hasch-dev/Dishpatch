"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [availableBookings, setAvailableBookings] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const [resAvailable, resMy] = await Promise.all([
      supabase.from("bookings").select("*").eq("status", "pending_assignment").is("chef_id", null),
      supabase.from("bookings").select("*").eq("chef_id", user.id)
    ]);

    if (resAvailable.data) setAvailableBookings(resAvailable.data);
    if (resMy.data) setMyBookings(resMy.data);
    setLoading(false);
  };

  const handleClaim = async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get client info from booking
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("client_id")
      .eq("id", bookingId)
      .single();

    if (!bookingData) return;

    // 2. Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ chef_id: user.id, status: "assigned" })
      .eq("id", bookingId);

    if (updateError) return;

    // 3. Create or Find Conversation
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(chef_id.eq.${user.id},client_id.eq.${bookingData.client_id}),and(chef_id.eq.${bookingData.client_id},client_id.eq.${user.id})`)
      .maybeSingle();

    let conversationId = existingConv?.id;

    if (!conversationId) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ chef_id: user.id, client_id: bookingData.client_id })
        .select().single();
      conversationId = newConv?.id;
    }

    // 4. Feedback and Redirect
    setMessage({ text: "Experience claimed! Opening chat...", type: 'success' });
    setTimeout(() => {
      if (conversationId) router.push(`/messages/${conversationId}`);
      else loadAllData();
    }, 1500);
  };

  const filteredAvailable = availableBookings.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-background text-primary animate-pulse italic">Loading Requests...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn("fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest")}>
            <CheckCircle2 className="h-4 w-4" /> {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-5xl font-serif italic text-foreground tracking-tight">Requests</h1>
          <p className="text-muted-foreground mt-3 font-light italic">Claim new assignments or view your current sessions.</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 rounded-full bg-muted/20" />
        </div>
      </header>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-14 p-0 gap-10">
          <TabsTrigger value="available" className="request-tab">Available ({availableBookings.length})</TabsTrigger>
          <TabsTrigger value="my-jobs" className="request-tab">Assigned ({myBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="pt-8">
          <div className="grid gap-6">
            {filteredAvailable.length === 0 ? <EmptyState message="No requests available." /> : 
              filteredAvailable.map((b) => <BookingCard key={b.id} booking={b} onAction={() => handleClaim(b.id)} actionText="Accept Booking" />)
            }
          </div>
        </TabsContent>

        <TabsContent value="my-jobs" className="pt-8">
          <div className="grid gap-6">
            {myBookings.length === 0 ? <EmptyState message="No claimed bookings." /> : 
              myBookings.map((b) => <BookingCard key={b.id} booking={b} isAssigned />)
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({ booking, onAction, actionText, isAssigned = false }: any) {
  let parsed: any = {};
  try { parsed = JSON.parse(booking.notes || "{}"); } catch {}

  return (
    <Card className="group border-border hover:border-primary/40 transition-all bg-card overflow-hidden">
      <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-bold py-1 px-3 bg-primary/10 text-primary rounded-full uppercase tracking-widest">{parsed.type || "Private"}</span>
             <span className="text-[9px] text-muted-foreground uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.event_time}</span>
          </div>
          <h3 className="text-2xl font-bold uppercase tracking-tighter italic font-serif">{booking.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
            <InfoItem label="Date" value={booking.event_date} />
            <InfoItem label="Guests" value={parsed.guestRange ? `${parsed.guestRange.min}-${parsed.guestRange.max}` : "TBD"} />
            <InfoItem label="Status" value={booking.status} highlight />
          </div>
        </div>
        {isAssigned ? (
           <Link href={`/messages/`}>
             <Button variant="outline" className="rounded-full px-8 uppercase text-[10px] font-bold tracking-widest">
               Open Chat <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
           </Link>
        ) : (
          <Button onClick={onAction} className="rounded-full px-8 bg-primary uppercase text-[10px] font-bold tracking-widest h-12">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value, highlight = false }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-serif italic", highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 border-2 border-dashed border-border rounded-[2rem]">
      <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-4" />
      <p className="text-muted-foreground italic font-serif">{message}</p>
    </div>
  );
}