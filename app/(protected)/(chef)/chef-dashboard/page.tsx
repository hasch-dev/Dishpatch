"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { 
  PhilippinePeso, Calendar, Utensils,
  Clock, CheckCircle2, Inbox, 
  Briefcase, MessageSquare, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChefDashboardPage() {
  const [data, setData] = useState<any>({ proposals: [], deals: [], requests: [], profile: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  
  // Use useMemo to ensure the supabase client is stable across renders
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const [prof, proposalsRes, dealsRes, requestsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        fetch(`/api/proposals?chef_id=${user.id}`).then(res => res.json()),
        fetch(`/api/deals?chef_id=${user.id}`).then(res => res.json()),
        supabase.from("bookings").select("*").eq("status", "open").is("chef_id", null)
      ]);

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
    // Dependency array is now stable
  }, [supabase, router]);

  const earnings = data.deals.reduce((sum: number, d: any) => sum + (d.deposit_paid ? d.deposit_amount : 0), 0);
  const pendingCount = data.proposals.filter((p: any) => p.status === "pending").length;
  const activeDeals = data.deals.filter((d: any) => d.booking?.status !== 'completed');

  const handleCompleteDeal = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    if (!confirm("Confirming completion will finalize the transaction. Proceed?")) return;
    
    setIsCompleting(bookingId);
    const res = await fetch('/api/bookings/complete', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });

    if (res.ok) {
      window.location.reload(); 
    } else {
      setIsCompleting(null);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-[10px] tracking-[0.5em] animate-pulse uppercase italic opacity-40 font-mono">
        Accessing_Chef_Terminal
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-12">
        <div>
          <div className="flex items-center gap-3 opacity-40 mb-4">
            <div className="h-[1px] w-6 bg-foreground" />
            <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Operational Overview</p>
          </div>
          <h1 className="text-5xl font-serif italic tracking-tighter">
            Chef {data.profile?.display_name?.split(' ')[0]}
          </h1>
        </div>
      </header>

      {/* INTERACTIVE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="Gross Earnings" 
            value={`₱${earnings.toLocaleString()}`} 
            icon={<PhilippinePeso className="h-4 w-4" />}
            href="/dashboard/earnings"
            subtext="Performance Data"
            variant="primary"
        />
        <StatCard 
            label="Marketplace" 
            value={data.requests.length} 
            icon={<Inbox className="h-4 w-4" />}
            href="/requests"
            subtext="Available Missions"
        />
        <StatCard 
            label="Deals" 
            value={activeDeals.length} 
            icon={<Briefcase className="h-4 w-4" />}
            href="/dashboard/deals"
            subtext="Active Logic"
        />
        <StatCard 
            label="Proposals" 
            value={pendingCount} 
            icon={<MessageSquare className="h-4 w-4" />}
            href="/proposals"
            subtext="Negotiations"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif italic text-2xl">Active Commissions</h2>
          <div className="space-y-4">
            {activeDeals.length === 0 ? (
              <div className="py-20 border border-dashed border-border/40 text-center flex flex-col items-center">
                <p className="font-serif italic text-muted-foreground opacity-60">No active culinary deployments.</p>
                <Link href="/requests" className="text-[10px] uppercase font-bold tracking-widest text-primary mt-4 hover:underline">
                    Scan Marketplace →
                </Link>
              </div>
            ) : (
              activeDeals.slice(0, 5).map((deal: any) => (
                <div 
                  key={deal.id} 
                  onClick={() => router.push(`/deal/${deal.booking.id}`)}
                  className="group flex items-center justify-between p-6 border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-card/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Utensils className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{deal.booking.title}</p>
                      <p className="text-[9px] uppercase tracking-widest opacity-40 mt-1">{deal.booking.event_date || "DATE TBD"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* OPERATIONAL CONTROLS */}
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 px-2">Operational Controls</h4>
            <div className="grid gap-3">
                <QuickActionButton 
                    title="Marketplace" 
                    desc="Respond to new briefs" 
                    icon={<Clock className="text-blue-500" />} 
                    href="/requests" 
                />
                <QuickActionButton 
                    title="Manifesto" 
                    desc="Refine Chef Profile" 
                    icon={<Utensils className="text-orange-500" />} 
                    href="/menu"
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, href, subtext, variant = "default" }: any) {
    return (
        <Link href={href} className="group">
            <Card className={cn(
                "rounded-none border-border/40 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl",
                variant === "primary" ? "bg-primary text-primary-foreground border-none" : "bg-card group-hover:border-primary/40"
            )}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className={cn("text-[9px] uppercase tracking-[0.2em]", variant === "primary" ? "opacity-70" : "text-muted-foreground")}>
                        {label}
                    </CardTitle>
                    <div className={cn("opacity-40", variant === "primary" ? "text-white" : "text-primary")}>{icon}</div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-serif italic tracking-tighter">{value}</div>
                    <p className={cn("text-[9px] mt-2 font-bold uppercase tracking-widest", variant === "primary" ? "opacity-60" : "text-primary/60")}>
                        {subtext}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickActionButton({ title, desc, icon, href }: any) {
    return (
        <Link href={href} className="group">
            <div className="flex items-center p-6 border border-border/40 bg-card/20 hover:bg-muted hover:border-primary/40 transition-all duration-300">
                <div className="h-10 w-10 bg-background border border-border/40 flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest">{title}</p>
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">{desc}</p>
                </div>
            </div>
        </Link>
    );
}