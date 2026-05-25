"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { createClient } from "@/lib/supabase/client";

export function LiveInventoryRefresher() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("live-inventory")
      .on(
        "postgres_changes",
        {
          event: "*", 
          schema: "public",
          table: "inventory_transactions",
        },
        () => {
          // Triggers a server-side re-fetch to get the new stock numbers
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  return null; 
}