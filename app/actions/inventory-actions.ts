"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adjustProductStock(payload: {
  productId: string;
  quantity: number;
  type: "IN" | "OUT";
  notes: string;
}) {
  try {
    const supabase = await createClient();

    // 1. Verify the Admin is actively logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication failed. You must be logged in to edit inventory." };
    }

    // 2. Commit the transaction to the Ledger
    const { error: insertError } = await supabase
      .from("inventory_transactions")
      .insert({
        product_id: payload.productId, // MUST match your Supabase column name exactly
        quantity: payload.quantity,
        type: payload.type,
        notes: payload.notes,
        user_id: user.id,              // Ties the action to the admin
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return { success: false, error: insertError.message };
    }

    // 3. Revalidate the Next.js cache for the inventory route
    revalidatePath("/inventory");
    
    return { success: true };
  } catch (error: any) {
    console.error("Server Action Exception:", error);
    return { success: false, error: "Internal Server Error during transaction." };
  }
}