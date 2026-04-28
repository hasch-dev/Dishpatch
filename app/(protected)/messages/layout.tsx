import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { MessageSquare, Search } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar" // Adjust path if needed
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* MAIN NAVIGATION: The App Sidebar (Far Left) */}
        <AppSidebar />

        <SidebarInset className="flex flex-1 overflow-hidden">
          <div className="flex w-full h-full">
            {/* COLUMN 1: Inbox Sidebar (The Message List) */}
            <aside className="w-80 border-r border-border flex flex-col bg-card/30 shrink-0">
              <div className="p-6 border-b border-border bg-background/50">
                <h1 className="font-serif italic font-bold text-2xl flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Messages
                </h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    placeholder="Search conversations..." 
                    className="w-full bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations && conversations.length > 0 ? (
                  conversations.map((chat: any) => {
                    const isChef = chat.chef_id === user.id
                    const partnerName = isChef ? chat.client?.display_name : chat.chef?.display_name

                    return (
                      <Link key={chat.id} href={`/messages/${chat.id}`}>
                        <div className="p-4 border-b border-border/40 hover:bg-muted/50 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif italic text-xl border border-primary/5">
                              {partnerName?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate uppercase tracking-tighter">
                                {partnerName}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate italic opacity-70 group-hover:opacity-100 transition-opacity">
                                Open history
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic text-sm">
                    No chats yet.
                  </div>
                )}
              </div>
            </aside>

            {/* COLUMN 2 & 3: Chat Room & Details Panel */}
            <main className="flex-1 flex overflow-hidden">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}