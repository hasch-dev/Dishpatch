import { MessageCircle } from "lucide-react"

export default function MessagesPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
      <div className="h-20 w-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 shadow-inner">
        <MessageCircle className="h-8 w-8 text-primary/40" />
      </div>
      <h2 className="font-serif italic text-3xl text-foreground tracking-tight">The Communications Suite</h2>
      <p className="text-muted-foreground max-w-sm mt-4 font-light leading-relaxed">
        Select an active consultation from the sidebar to review your message history, negotiate terms, or speak with the Concierge.
      </p>
    </div>
  )
}