"use client"

export function TextBubble({ 
  content, 
  createdAt, 
  isMe 
}: { 
  content: string
  createdAt: string
  isMe: boolean 
}) {
  return (
    <div className={`flex w-full my-1 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
        isMe 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : "bg-muted text-foreground rounded-bl-sm"
      }`}>
        <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        <span className={`text-[9px] font-medium tracking-wide mt-1.5 block opacity-70 ${isMe ? "text-right" : "text-left"}`}>
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}