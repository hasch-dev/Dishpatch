"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConversationList } from "./conversation-list";

interface Props {
  conversations: any[];
  currentUserId: string;
  children: React.ReactNode;
}

export function InboxShell({ conversations, currentUserId, children }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter((c) => {
      const content = c.latestMessage?.content?.toLowerCase() || "";
      const subject = c.subject?.toLowerCase() || "";
      return content.includes(searchTerm.toLowerCase()) || subject.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar: The "Hub" */}
      <aside className="w-[400px] border-r border-border flex flex-col bg-background">
        
        {/* Header - Aligned with your Landing Page aesthetic */}
        <div className="p-8 border-b border-border">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <span className="h-px w-8 bg-primary" />
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
              Dish Patch PH
            </span>
          </motion.div>
          
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            The <br/>
            <span className="text-primary italic font-medium lowercase">
              Inbox
            </span>
          </h2>
        </div>
        
        {/* Search */}
        <div className="px-8 py-6 border-b border-border">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-primary transition-colors placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[10px] placeholder:font-bold"
          />
        </div>
        
        {/* List Container */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="p-4"
            >
              <ConversationList 
                conversations={filteredConversations} 
                currentUserId={currentUserId} 
              />
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                System Status
              </span>
              <p className="text-sm font-light italic">
                {searchTerm ? "No stories found." : "The inbox is clear."}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-muted/5 relative">
        {children}
      </main>
    </div>
  );
}