import { createClient } from "@/lib/supabase/client"

export async function getProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}