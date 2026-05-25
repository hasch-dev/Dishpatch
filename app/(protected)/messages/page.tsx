import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background text-center p-8">
      <div className="h-12 w-12 rounded-full bg-foreground/[0.02] border border-foreground/5 flex items-center justify-center text-muted-foreground mb-4 shadow-sm animate-pulse">
        <MessageSquare className="h-5 w-5 opacity-40 text-primary" />
      </div>
      <h3 className="font-serif italic font-bold text-base tracking-tight text-foreground">
        No Chat Selected
      </h3>
      <p className="text-[11px] text-muted-foreground max-w-xs mt-1 mx-auto leading-relaxed italic opacity-80">
        Select an active booking sequence or contact the Concierge desk via the sidebar grid to initialize communication.
      </p>
    </div>
  )
}