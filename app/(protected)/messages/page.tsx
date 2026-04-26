import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { MessageSquare, Clock, ChevronRight } from "lucide-react"

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch conversations and join the profiles
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      chef_id,
      client_id,
      chef:chef_id(display_name),
      client:client_id(display_name)
    `)
    .or(`chef_id.eq.${user.id},client_id.eq.${user.id}`)

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-background">
      <header className="mb-10">
        <h1 className="text-4xl font-serif italic text-foreground flex items-center gap-3">
          <MessageSquare className="h-10 w-10 text-primary" />
          Inbox
        </h1>
        <p className="text-muted-foreground mt-2 font-light italic">
          Your private history of culinary consultations.
        </p>
      </header>

      <div className="grid gap-4">
        {conversations && conversations.length > 0 ? (
          conversations.map((chat: any) => {
            // Logic: Determine if you are the Chef or Client to show the other person's name
            const isChef = chat.chef_id === user.id
            const partner = isChef ? chat.client : chat.chef
            const partnerName = partner?.display_name || "Unknown User"

            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <Card className="p-6 hover:bg-muted/40 transition-all border-border bg-card flex items-center justify-between group cursor-pointer shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif italic text-2xl">
                      {partnerName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xl tracking-tight uppercase">
                        {partnerName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>View message history</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <p className="text-muted-foreground italic font-serif text-lg">
              No conversations found. Your history will appear here once you start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}