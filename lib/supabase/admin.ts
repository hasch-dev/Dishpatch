// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// This client bypasses RLS. ONLY use this in secure server routes like webhooks.
// NEVER expose this to the frontend.
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
{
    auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)