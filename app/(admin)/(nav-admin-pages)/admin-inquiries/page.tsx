import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Terminal, ShieldCheck } from "lucide-react"

export default async function AdminInquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/messages")

  // Verify the user is an admin using your profiles table rule
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle()

  // Fallback protection: if they aren't hq staff, kick them back to safety
  if (profile?.user_type !== "admin") {
    redirect("/messages")
  }

  // Fetch all support inquiries along with their associated messages
  const { data: inquiries } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      client_id,
      status,
      priority,
      messages (
        content,
        created_at
      )
    `)
    .eq("conversation_type", "support")
    .order("last_message_at", { ascending: false })

  // Pull all profiles to map user IDs to names cleanly without complex nested joins
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")

  const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || [])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-background min-h-screen text-foreground animate-in fade-in duration-300">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-start border-b border-foreground/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            <Terminal size={12} /> HQ Operations Control
          </div>
          <h1 className="text-3xl font-serif font-bold italic tracking-tight">Support Inquiries</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time deployment and concierge request routing.</p>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid gap-3">
        {inquiries?.map((ticket) => {
          const clientName = profileMap.get(ticket.client_id) || "Anonymous Client"
          
          // Grabbing the most recent communication statement
          const sortedMessages = ticket.messages?.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          const latestMessage = sortedMessages?.[0]?.content || "No message data registered yet."

          return (
            <Link href={`/messages/${ticket.id}`} key={ticket.id} className="block group">
              <div className="p-5 border border-foreground/5 bg-card/40 hover:bg-foreground/[0.02] hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex items-center justify-between">
                
                <div className="space-y-1.5 min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      {clientName}
                    </span>
                    <span className={`text-[8px] uppercase px-2 py-0.5 font-bold tracking-widest ${
                      ticket.priority === 'urgent' || ticket.priority === 'high'
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-foreground/5 text-muted-foreground'
                    }`}>
                      {ticket.priority || 'normal'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    "{latestMessage}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[9px] text-muted-foreground font-mono hidden sm:inline opacity-60">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary border border-primary/10 bg-primary/5 px-4 py-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    Join Console &rarr;
                  </div>
                </div>
                
              </div>
            </Link>
          )
        })}

        {/* Empty State Exception Handler */}
        {!inquiries?.length && (
          <div className="text-center py-20 border border-dashed border-foreground/10 bg-card/10">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-3" />
            <p className="text-xs italic text-muted-foreground tracking-wide font-serif">
              Operations queue is clear. No active tickets open.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}