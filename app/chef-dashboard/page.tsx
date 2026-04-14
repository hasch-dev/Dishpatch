"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogOut, PhilippinePeso } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHatIcon } from "@phosphor-icons/react";

export default function ChefDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  const [profile, setProfile] = useState<any>(null);
  const [chefDetails, setChefDetails] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"pending" | "deals" | "completed">(
    "pending",
  );
  const [search, setSearch] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const completedDeals = deals.filter((d) => d.deposit_paid && d.final_paid);
  const pendingProposals = proposals.filter((p) => p.status === "pending");

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, location_address")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: chefData } = await supabase
        .from("chef_details")
        .select("cuisine_types, session_rate")
        .eq("id", user.id)
        .single();

      if (chefData) setChefDetails(chefData);

      // ✅ FIX: pass chef_id to API
      const proposalsRes = await fetch(`/api/proposals?chef_id=${user.id}`);
      const dealsRes = await fetch(`/api/deals?chef_id=${user.id}`);

      if (proposalsRes.ok) {
        const { data } = await proposalsRes.json();
        setProposals(data);
      }

      if (dealsRes.ok) {
        const { data } = await dealsRes.json();
        setDeals(data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const earnings = deals.reduce(
    (sum, d) => sum + (d.deposit_paid ? d.deposit_amount : 0),
    0,
  );

  const filteredData = useMemo(() => {
    const term = search.toLowerCase();

    if (activeTab === "pending") {
      return pendingProposals.filter((p) =>
        p.booking.title.toLowerCase().includes(term),
      );
    }

    if (activeTab === "deals") {
      return deals.filter((d) => d.booking.title.toLowerCase().includes(term));
    }

    return completedDeals.filter((d) =>
      d.booking.title.toLowerCase().includes(term),
    );
  }, [search, activeTab, pendingProposals, deals, completedDeals]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* HEADER */}
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHatIcon />
            <h1 className="font-semibold">Chef Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>

            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-3 py-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* LEFT SIDE */}
          <div className="space-y-3">
            {/* PROFILE CARD */}
            <Card className="border rounded-lg">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-medium">
                  {profile?.display_name || "Chef"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {profile?.location_address || "No location set"}
                </p>

                {chefDetails?.cuisine_types?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {chefDetails.cuisine_types.slice(0, 3).map((c: string) => (
                      <span
                        key={c}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {chefDetails?.session_rate > 0 && (
                  <p className="text-sm font-semibold text-primary flex items-center gap-1 mt-2">
                    <PhilippinePeso size={14} />
                    {chefDetails.session_rate}/session
                  </p>
                )}
              </CardContent>
            </Card>

            {/* STATS */}
            <Card className="border rounded-lg">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold">
                  {pendingProposals.length}
                </p>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Deals</p>
                <p className="text-xl font-semibold">{deals.length}</p>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardContent className="p-3 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="text-xl font-semibold text-primary flex gap-1">
                  <PhilippinePeso />
                  {earnings.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-3">
            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activeTab === "pending" ? "default" : "outline"}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending ({pendingProposals.length})
                </Button>

                <Button
                  size="sm"
                  variant={activeTab === "deals" ? "default" : "outline"}
                  onClick={() => setActiveTab("deals")}
                >
                  Active ({deals.length})
                </Button>

                <Button
                  size="sm"
                  variant={activeTab === "completed" ? "default" : "outline"}
                  onClick={() => setActiveTab("completed")}
                >
                  Completed ({completedDeals.length})
                </Button>
              </div>

              <Input
                placeholder="Search client / booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {/* CONTENT */}
            <div className="space-y-2 min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {filteredData.length === 0 ? (
                    <Card>
                      <CardContent className="p-4 text-center text-muted-foreground">
                        No results found
                      </CardContent>
                    </Card>
                  ) : (
                    filteredData.map((item: any) => (
                      <Card
                        key={item.id}
                        className="border rounded-lg hover:shadow-sm transition"
                      >
                        <CardContent className="p-4 space-y-1">
                          <h3 className="font-medium text-sm">
                            {item.booking.title}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {item.booking.event_date}
                          </p>

                          {"proposed_price" in item && (
                            <p className="text-primary text-sm font-semibold">
                              ₱{item.proposed_price.toFixed(2)}
                            </p>
                          )}

                          {"agreed_price" in item && (
                            <p className="text-primary text-sm font-semibold">
                              ₱{item.agreed_price.toFixed(2)}
                            </p>
                          )}

                          <Link href={`/booking/${item.booking_id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                            >
                              View
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
