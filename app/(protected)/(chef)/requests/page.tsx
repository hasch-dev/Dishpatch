"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import MarketplaceCard from "@/components/chef/marketplace-card";

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
    // Fetch bookings that are 'open', not assigned, and not expired
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "open")
      .is("chef_id", null)
      .eq("client_purged", false)
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!chefId) return;
    setIsAccepting(bookingId);
    
    // Status moves to 'negotiating' so chef can message and provide a final quote
    const { error } = await supabase
      .from("bookings")
      .update({ 
        chef_id: chefId,
        status: 'negotiating' 
      })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to secure commission.");
      setIsAccepting(null);
    } else {
      toast.success("Commission secured. Open a dialogue with the client.");
      router.push(`/deal/${bookingId}`); 
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="text-[10px] tracking-[0.5em] animate-pulse uppercase italic opacity-40">Scanning_Marketplace</div>
      <div className="h-[1px] w-12 bg-primary/20" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <header className="px-8 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/10 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-40">
              <div className="h-[1px] w-6 bg-foreground" />
              <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Intelligence Report</p>
            </div>
            <h1 className="text-6xl font-serif italic tracking-tighter leading-none">The Marketplace</h1>
            <p className="text-muted-foreground text-sm font-serif italic max-w-md">
              Secure exclusive culinary commissions. All assignments enter negotiation phase upon acceptance.
            </p>
          </div>
          
          <Badge variant="outline" className="rounded-none px-6 py-2 text-[10px] font-mono border-primary/20 text-primary uppercase tracking-[0.3em]">
             {requests.length} Available Missions
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-border/40 grayscale opacity-40">
            <Info className="h-10 w-10 mb-4 stroke-[1px]" />
            <p className="font-serif italic text-xl">The marketplace is currently quiet.</p>
            <p className="text-[10px] uppercase tracking-widest mt-2">New requests will appear here in real-time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {requests.map((booking) => (
                <MarketplaceCard 
                  key={booking.id} 
                  booking={booking} 
                  isAccepting={isAccepting === booking.id}
                  onAccept={() => handleAcceptBooking(booking.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}