"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Info, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MarketplaceCard from "@/components/chef/marketplace-card";
import MarketplaceControls from "@/components/chef/marketplace-controls";
import BookingReviewModal from "@/components/chef/booking-review-modal";

type TabMode = "marketplace" | "active";

export default function ChefRequestsPage() {
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [activeCommissions, setActiveCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabMode>("marketplace");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [chefId, setChefId] = useState<string | null>(null);
  
  // View Matrix States
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Pipeline Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const initializeMatrix = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");
      setChefId(user.id);
      fetchLedgers(user.id);
    };
    initializeMatrix();
  }, []);

  const fetchLedgers = async (uid: string) => {
    setLoading(true);
    try {
      const [openRes, activeRes] = await Promise.all([
        supabase
          .from("bookings")
          // Reverted back to standard select
          .select("*") 
          .eq("status", "open")
          .is("chef_id", null)
          .eq("client_purged", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          // Reverted back to standard select
          .select("*")
          .eq("chef_id", uid)
          .in("status", ["negotiating", "confirmed", "in_progress"])
          .eq("client_purged", false)
          .order("created_at", { ascending: false })
      ]);

      // Added these so you are never flying blind if a query fails
      if (openRes.error) console.error("Supabase Open Requests Error:", openRes.error.message);
      if (activeRes.error) console.error("Supabase Active Commissions Error:", activeRes.error.message);

      if (!openRes.error) setOpenRequests(openRes.data || []);
      if (!activeRes.error) setActiveCommissions(activeRes.data || []);
    } catch (err) {
      console.error("Ledger Sync Error:", err);
      toast.error("Database connection failure. Unable to secure registries.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCommunications = async (bookingId: string) => {
    setIsProcessing(bookingId);
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    router.push(conversation?.id ? `/messages/${conversation.id}` : `/messages`);
  };

  const handleSelectBookingForReview = (bookingId: string) => {
    const dataSet = activeTab === 'marketplace' ? openRequests : activeCommissions;
    const booking = dataSet.find(b => b.id === bookingId);
    if (booking) setSelectedBooking(booking);
  };

  const handleFinalizeAcceptBooking = async (finalizedTime: string) => {
    // Check 1: Are our core IDs missing?
    if (!chefId) {
      toast.error("System Error: Chef authorization ID missing.");
      return;
    }
    if (!selectedBooking) {
      toast.error("System Error: Dossier data corrupted or missing.");
      return;
    }

    const bookingId = selectedBooking.id;
    const clientId = selectedBooking.user_id;
    
    // Check 2: Does this booking actually have a client attached?
    if (!clientId) {
      toast.error("Database Error: This booking lacks a valid Client ID.");
      return;
    }

    setIsProcessing(bookingId);
    
    try {
      // Step 1: Claim the Booking
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          chef_id: chefId,
          event_time_pref: finalizedTime,
          status: 'negotiating' 
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Supabase Update Error Payload:", JSON.stringify(updateError, null, 2));
        toast.error(`Claim failed: ${updateError.message}`);
        setIsProcessing(null);
        return;
      }

      // Step 2: Check if a conversation already exists
      let { data: conversation, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("chef_id", chefId)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase Fetch Conversation Error:", fetchError);
      }

      // Step 3: CREATE the connection if it doesn't exist
      if (!conversation) {
        const { data: newConversation, error: insertError } = await supabase
          .from("conversations")
          .insert({
            booking_id: bookingId,
            chef_id: chefId,
            client_id: clientId, 
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Supabase Insert Conversation Error:", insertError);
          // If you don't have a 'conversations' table yet, or RLS is blocking it, it will fail right here.
          toast.error(`Comms Link Failed: ${insertError.message}`);
          setIsProcessing(null);
          return;
        }
        
        conversation = newConversation;
      }

      // Step 4: Route directly into the newly created chat room
      toast.success("Dossier secured. Direct connection established.");
      setSelectedBooking(null);
      setOpenRequests(prev => prev.filter(b => b.id !== bookingId));
      
      // Push directly to the unique conversation URL
      router.push(`/messages/${conversation?.id}`);
      
    } catch (err: any) {
      console.error("Unexpected System Error:", err);
      toast.error(`Critical Failure: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Complex Pipeline Filtration Matrix
  const filteredDataset = useMemo(() => {
    let dataset = [...(activeTab === "marketplace" ? openRequests : activeCommissions)];

    if (typeFilter !== 'all') {
      dataset = dataset.filter(b => {
        const dbType = b.booking_type?.toLowerCase() || '';
        if (typeFilter === 'private') return dbType.includes('private');
        return dbType === typeFilter.toLowerCase();
      });
    }

    if (searchQuery.trim() !== '') {
      const token = searchQuery.toLowerCase().trim();
      dataset = dataset.filter(b => 
        b.title?.toLowerCase().includes(token) ||
        b.location_city?.toLowerCase().includes(token) ||
        b.occasion?.toLowerCase().includes(token) ||
        b.recipient_name?.toLowerCase().includes(token)
      );
    }

    dataset.sort((x, y) => {
      if (sortBy === 'created_desc') return new Date(y.created_at).getTime() - new Date(x.created_at).getTime();
      if (sortBy === 'created_asc') return new Date(x.created_at).getTime() - new Date(y.created_at).getTime();
      if (sortBy === 'event_asc') {
        if (!x.event_date) return 1;
        if (!y.event_date) return -1;
        return new Date(x.event_date).getTime() - new Date(y.event_date).getTime();
      }
      if (sortBy === 'event_desc') {
        if (!x.event_date) return 1;
        if (!y.event_date) return -1;
        return new Date(y.event_date).getTime() - new Date(x.event_date).getTime();
      }
      return 0;
    });

    return dataset;
  }, [openRequests, activeCommissions, activeTab, typeFilter, searchQuery, sortBy]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-5 font-sans text-foreground">
      <div className="text-[10px] tracking-[0.6em] text-muted-foreground animate-pulse uppercase font-black pl-[0.6em]">
        Accessing_Dossiers
      </div>
      <div className="h-[1px] w-16 bg-primary/30 relative overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-primary w-1/2"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  return (
    // overflow-y-scroll forces scrollbar track to remain visible, stopping horizontal jumping
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24 overflow-y-scroll">
      
      <header className="max-w-[1600px] mx-auto px-6 md:px-12 pt-16 md:pt-24 space-y-12 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/20 pb-12">
          <div className="space-y-6 shrink-0">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-[1px] w-8 bg-muted-foreground/40" />
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] flex items-center gap-2 whitespace-nowrap">
                <Briefcase className="h-3 w-3" /> Ledger Interface
              </p>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none pr-10">
              Workspace
            </h1>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3 flex-1 max-w-lg">
            <p className="text-xs text-muted-foreground font-serif italic md:text-right leading-relaxed mb-1.5">
              Secure new directives from the Marketplace. Select "Review & Secure" to analyze full dossier details and establish a final time framework before opening communication. Manage secured commissions in the "Active" tab.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-2 border-b border-border/20 overflow-x-auto no-scrollbar pt-2">
          {(['marketplace', 'active'] as TabMode[]).map((tab) => {
            const count = tab === 'marketplace' ? openRequests.length : activeCommissions.length;
            const label = tab === 'marketplace' ? "Open Marketplace" : "Active Commissions";
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-2.5 pb-5 px-0.5 transition-all relative group shrink-0",
                  activeTab === tab ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
                <span className="text-[9px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                  [{count}]
                </span>
                {activeTab === tab && (
                  <motion.div 
                    layoutId="ledger-tab-underline" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 md:px-12 pt-8 flex-grow">
        
        <MarketplaceControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {filteredDataset.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 border border-dashed border-border/40 bg-muted/5 text-center mt-6 animate-in fade-in duration-500">
            <Info className="h-6 w-6 mb-3 text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-serif italic text-sm text-muted-foreground">
              No matching ledger entries found within this registry Framework.
            </p>
          </div>
        ) : (
          <div 
            className={cn(
              "mt-6 w-full animate-in fade-in duration-300",
              viewMode === 'list' 
                ? "flex flex-col gap-3" 
                : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            )}
          >
            {filteredDataset.map((booking) => (
              <MarketplaceCard 
                key={booking.id} 
                booking={booking} 
                variant={activeTab}
                viewMode={viewMode}
                isProcessing={isProcessing === booking.id}
                onPrimaryAction={() => 
                  activeTab === 'marketplace' 
                    ? handleSelectBookingForReview(booking.id) 
                    : handleOpenCommunications(booking.id)
                }
              />
            ))}
          </div>
        )}
      </main>

      <BookingReviewModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onConfirmAccept={handleFinalizeAcceptBooking}
        isProcessing={isProcessing === selectedBooking?.id}
      />
    </div>
  );
}