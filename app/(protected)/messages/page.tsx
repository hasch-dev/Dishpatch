import { MessageCircle } from "lucide-react"

export default function MessagesPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
        <MessageCircle className="h-10 w-10 text-primary/40" />
      </div>
      <h2 className="font-serif italic text-2xl text-foreground">Your Conversations</h2>
      <p className="text-muted-foreground max-w-xs mt-2 font-light">
        Select a chat from the sidebar to view your message history and start a consultation.
      </p>
    </div>
  )
}