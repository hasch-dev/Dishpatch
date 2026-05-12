"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  PhilippinePeso, TrendingUp, Calendar, Utensils,
  Clock, CheckCircle2, ArrowRight, Inbox
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChefDashboardPage() {
  const [data, setData] = useState<any>({ proposals: [], deals: [], requests: [], profile: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [prof, proposalsRes, dealsRes, requestsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        fetch(`/api/proposals?chef_id=${user.id}`).then(res => res.json()),
        fetch(`/api/deals?chef_id=${user.id}`).then(res => res.json()),
        // Fetch open customer requests directly from the bookings table
        supabase.from("bookings").select("*").eq("status", "open").order("created_at", { ascending: false })
      ]);

      // Filter out dates that have passed to match the user-side expiration logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const validRequests = (requestsRes.data || []).filter((req: any) => {
        if (!req.event_date) return true;
        const eventDate = new Date(req.event_date);
        return eventDate >= today; 
      });

      setData({
        profile: prof.data,
        proposals: proposalsRes.data || [],
        deals: dealsRes.data || [],
        requests: validRequests
      });
      setIsLoading(false);
    };
    loadDashboard();
  }, [supabase]);

  // Note: You might want to update this calculation later to pull directly 
  // from profile.total_earned based on our new SQL structure.
  const earnings = data.deals.reduce((sum: number, d: any) => sum + (d.deposit_paid ? d.deposit_amount : 0), 0);
  const pendingCount = data.proposals.filter((p: any) => p.status === "pending").length;
  const activeCount = data.deals.filter((d: any) => !d.final_paid).length;
  const openRequestsCount = data.requests.length;

  const handleCompleteDeal = async (bookingId: string) => {
    if (!confirm("Confirming completion will finalize the transaction and notify the client. Proceed?")) return;
    
    setIsCompleting(bookingId);
    const res = await fetch('/api/bookings/complete', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });

    if (res.ok) {
      window.location.reload(); 
    } else {
      alert("There was an error completing the commission.");
      setIsCompleting(null);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-serif italic text-foreground">Welcome back, Chef {data.profile?.display_name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-2 font-light italic">Here is your culinary performance overview.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] opacity-80">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-1">
              <PhilippinePeso className="h-6 w-6" />
              {earnings.toLocaleString()}
            </div>
            <p className="text-[10px] mt-2 opacity-70 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        {/* NEW CARD: Open Requests */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Inbox className="h-3 w-3" /> New Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{openRequestsCount}</div>
            <p className="text-[10px] mt-2 text-primary font-bold italic">Available commissions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
            <p className="text-[10px] mt-2 text-muted-foreground italic">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pending Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-[10px] mt-2 text-muted-foreground italic">Awaiting client response</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-[10px] mt-2 text-muted-foreground italic">Scheduled this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY */}
        <Card className="lg:col-span-2 border-border bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif italic text-xl">Active Commissions</CardTitle>
            <Link href="/requests">
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-primary">
                View All <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.deals.slice(0, 3).map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">{deal.booking.title}</p>
                    <p className="text-[10px] text-muted-foreground italic">{deal.booking.event_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  {deal.booking.payment_status === 'paid' && !deal.booking.chef_confirmed_completion ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteDeal(deal.booking.id)}
                      disabled={isCompleting === deal.booking.id}
                      className="h-7 text-[9px] uppercase tracking-widest rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isCompleting === deal.booking.id ? (
                        'Processing...'
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3 w-3" /> Finish & Collect
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-[10px] bg-muted px-2 py-1 rounded font-bold uppercase tracking-widest text-muted-foreground">
                      {deal.booking.chef_confirmed_completion ? 'Completed' : 'Awaiting Details'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground px-2">Quick Actions</h4>
            <Link href="/requests" className="block w-full">
                <Button className="w-full justify-start h-16 rounded-2xl bg-card border border-border text-foreground hover:bg-muted group">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold">Manage Requests</p>
                        <p className="text-[10px] text-muted-foreground italic">Respond to new clients</p>
                    </div>
                </Button>
            </Link>
            <Link href="/menu" className="block w-full">
                <Button className="w-full justify-start h-16 rounded-2xl bg-card border border-border text-foreground hover:bg-muted group">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <Utensils className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold">Update Menu</p>
                        <p className="text-[10px] text-muted-foreground italic">Refresh your offerings</p>
                    </div>
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}