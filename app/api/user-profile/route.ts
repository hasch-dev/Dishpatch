import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, location_address")
      .eq("id", request.nextUrl.searchParams.get("userId"))
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  } finally {
    await supabase.removeAllListeners();
    await supabase.close();
  } 
}