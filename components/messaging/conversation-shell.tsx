"use client"

import { ReactNode } from "react"

interface Props {
  sidebar: ReactNode
  content: ReactNode
  context?: ReactNode
}

export function ConversationShell({
  sidebar,
  content,
  context,
}: Props) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* LEFT */}
      <aside className="w-80 border-r border-border shrink-0 bg-card/30">
        {sidebar}
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex overflow-hidden">
        {content}
      </main>

      {/* RIGHT */}
      {context && (
        <aside className="w-96 border-l border-border shrink-0 hidden xl:flex">
          {context}
        </aside>
      )}
    </div>
  )
}