"use client";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { 
  CalendarClock, Utensils, MessageSquare, 
  Activity, Briefcase, Banknote, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns";

export default function ChefDashboardPage() {
  const [data, setData] = useState<any>({ 
    profile: null, 
    activeBookingsCount: 0,
    negotiatingCount: 0,
    awaitingPaymentCount: 0,
    upcomingEvents: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const today = new Date();
      const nextWeek = addDays(today, 7);

      const [profRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("bookings").select("*").eq("chef_id", user.id),
      ]);

      const bookings = bookingsRes.data || [];
      const profile = profRes.data;

      // Operational Metrics
      const activeBookingsCount = bookings.filter(b => 
        ['confirmed', 'in_progress'].includes(b.status)
      ).length;
      
      const negotiatingCount = bookings.filter(b => b.status === 'negotiating').length;
      
      const awaitingPaymentCount = bookings.filter(b => 
        ['confirmed', 'in_progress'].includes(b.status) && b.payment_status === 'pending'
      ).length;

      // Upcoming Timeline (Next 7 Days)
      const upcoming = bookings
        .filter(b => b.event_date && isAfter(parseISO(b.event_date), today) && isBefore(parseISO(b.event_date), nextWeek))
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 6);

      setData({
        profile,
        activeBookingsCount,
        negotiatingCount,
        awaitingPaymentCount,
        upcomingEvents: upcoming,
      });
      setIsLoading(false);
    };

    loadDashboard();
  }, [supabase, router]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-[10px] tracking-[0.5em] animate-pulse uppercase italic opacity-40 font-mono pl-[0.5em]">
        Loading_Workspace...
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-24 font-sans">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/20 pb-8">
        <div>
          <div className="flex items-center gap-3 text-muted-foreground mb-3">
            <div className="h-[1px] w-6 bg-muted-foreground/50" />
            <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Chef Workspace</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter">
            Welcome, {data.profile?.display_name?.split(' ')[0] || "Chef"}
          </h1>
        </div>
        <div className="text-right">
           <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">System Status</p>
           <p className="text-xs font-mono text-green-600 flex items-center gap-2 justify-end mt-1">
             <Activity className="h-3 w-3" /> Accepting Requests
           </p>
        </div>
      </header>

      {/* INTELLIGENCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="Confirmed Bookings" 
            value={data.activeBookingsCount} 
            icon={<Briefcase className="h-4 w-4" />}
            href="/requests"
            subtext="Secured & Scheduled"
            variant="primary"
        />
        <StatCard 
            label="Awaiting Payment" 
            value={data.awaitingPaymentCount} 
            icon={<Banknote className="h-4 w-4" />}
            href="/requests"
            subtext="Action Required"
        />
        <StatCard 
            label="Pending Requests" 
            value={data.negotiatingCount} 
            icon={<MessageSquare className="h-4 w-4" />}
            href="/messages"
            subtext="Awaiting Quotes"
        />
        <StatCard 
            label="Upcoming Events" 
            value={data.upcomingEvents.length} 
            icon={<CalendarClock className="h-4 w-4" />}
            href="/requests"
            subtext="Next 7 Days"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/10 pb-4">
            <h2 className="font-serif italic text-2xl">Your Itinerary</h2>
            <Link href="/requests" className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View Calendar <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.upcomingEvents.length === 0 ? (
              <div className="py-16 border border-dashed border-border/40 text-center flex flex-col items-center bg-muted/5 rounded-xl">
                <CalendarClock className="h-8 w-8 text-muted-foreground/30 mb-4" />
                <p className="font-serif italic text-muted-foreground text-lg">No upcoming events.</p>
              </div>
            ) : (
              data.upcomingEvents.map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-6 p-5 border border-border/20 bg-card hover:border-primary/40 transition-all rounded-xl shadow-sm cursor-pointer" onClick={() => router.push(`/requests/${booking.id}`)}>
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-3 bg-muted/30 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {format(parseISO(booking.event_date), "MMM")}
                    </span>
                    <span className="text-2xl font-serif italic text-foreground">
                      {format(parseISO(booking.event_date), "dd")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{booking.title || "Private Event"}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="font-mono">{booking.event_time_pref || "Time TBD"}</span>
                      <span>•</span>
                      <span className="truncate">{booking.location_city || "Location TBD"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border-b border-border/10 pb-4">
              Quick Actions
            </h4>
            <div className="grid gap-3">
                <QuickActionButton 
                    title="Manage Bookings" 
                    desc="View all requests and active jobs" 
                    icon={<Briefcase className="h-4 w-4 text-foreground" />} 
                    href="/requests" 
                />
                <QuickActionButton 
                    title="Edit Menu & Profile" 
                    desc="Update your public offerings" 
                    icon={<Utensils className="h-4 w-4 text-foreground" />} 
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
                "rounded-xl border border-border/30 shadow-sm transition-all duration-300 group-hover:-translate-y-1",
                variant === "primary" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40"
            )}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className={cn("text-[10px] font-bold uppercase tracking-[0.1em]", variant === "primary" ? "text-primary-foreground/90" : "text-muted-foreground")}>
                        {label}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg", variant === "primary" ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                      {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-serif italic tracking-tighter truncate">{value}</div>
                    <p className={cn("text-[10px] mt-2 font-medium", variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {subtext}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickActionButton({ title, desc, icon, href }: any) {
    return (
        <Link href={href} className="group block">
            <div className="flex items-center p-4 border border-border/20 bg-card rounded-xl hover:shadow-md hover:border-primary/30 transition-all duration-300">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors shrink-0">
                    {icon}
                </div>
                <div className="text-left overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
                </div>
            </div>
        </Link>
    );
}