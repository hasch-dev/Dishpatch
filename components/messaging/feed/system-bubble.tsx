"use client"

import { AlertCircle } from "lucide-react"

export function SystemBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-center my-2">
      <div className="bg-foreground/[0.03] border border-foreground/5 px-3 py-1 rounded-none text-[9px] font-mono tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
        <AlertCircle size={10} className="text-primary" /> {content}
      </div>
    </div>
  )
}