"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RequestsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // ================= LOAD BOOKINGS =================
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return router.push("/auth/login");

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending_assignment")
      .is("chef_id", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }

    setLoading(false);
  };

  // ================= CLAIM BOOKING =================
  const handleClaim = async (bookingId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("bookings")
      .update({
        chef_id: user.id,
        status: "assigned",
      })
      .eq("id", bookingId);

    if (!error) {
      // remove from UI
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      // notification
      setMessage("Client added to your pending bookings");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-foreground p-6 space-y-4">

      {/* NOTIFICATION */}
      {message && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded">
          {message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Client Requests</h1>

        <Button variant="outline" onClick={() => router.push("/chef-dashboard")}>
          Back
        </Button>
      </div>

      {/* EMPTY STATE */}
      {bookings.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No available client requests
          </CardContent>
        </Card>
      )}

      {/* BOOKINGS LIST */}
      {bookings.map((b) => {
        let parsed: any = {};

        try {
          parsed = JSON.parse(b.notes || "{}");
        } catch {}

        return (
          <Card key={b.id}>
            <CardContent className="p-4 space-y-2">

              <p className="font-medium">{b.title}</p>

              <p className="text-sm text-muted-foreground">
                {b.event_date}
              </p>

              <p className="text-xs text-muted-foreground">
                {parsed.location || "No location"}
              </p>

              <p className="text-xs">
                {parsed.type || "event"}
              </p>

              {parsed.guestRange && (
                <p className="text-xs text-muted-foreground">
                  Guests: {parsed.guestRange.min} - {parsed.guestRange.max}
                </p>
              )}

              {/* CLAIM BUTTON */}
              <Button onClick={() => handleClaim(b.id)}>
                Accept Booking
              </Button>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}