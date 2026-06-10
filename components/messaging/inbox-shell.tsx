"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { InboxItem } from "./inbox-item";     

interface Props {
  conversations: any[];
  currentUserId: string;
  children: React.ReactNode;
}

type RoomStatus = "ALL" | "NEGOTIATING" | "SUCCESS" | "CANCELLED"

export function InboxShell({ conversations: initialConversations, currentUserId, children }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<RoomStatus>("ALL");
  
  // 1. Take control of the live state natively
  const [liveConversations, setLiveConversations] = useState(initialConversations);
  const supabase = createClient();

  // Sync gracefully if the server forces a router.refresh()
  useEffect(() => {
    setLiveConversations(initialConversations);
  }, [initialConversations]);

  // 2. THE GLOBAL INBOX REAL-TIME ENGINE
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('global_inbox_listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new && payload.new.conversation_id) {
            setLiveConversations((prev) => {
              const newConvos = [...prev];
              const idx = newConvos.findIndex(c => c.id === payload.new.conversation_id);
              
              if (idx === -1) return prev; 

              const conv = { ...newConvos[idx] };

              // Update the latest message snippet text
              const isNewer = !conv.latestMessage || new Date(payload.new.created_at) >= new Date(conv.latestMessage.created_at);
              if (isNewer || payload.new.id === conv.latestMessage?.id) {
                 conv.latestMessage = payload.new;
              }

              // --- LIVE TAG COMPUTATION ---
              // Shift sidebar UI colors instantly the second a proposal is updated
              if (payload.new.message_type === "proposal") {
                if (payload.new.proposal_status === "accepted") conv.roomTag = "success";
                else if (payload.new.proposal_status === "rejected" || payload.new.proposal_status === "expired") conv.roomTag = "cancelled";
                else conv.roomTag = "negotiating";
              }

              // Instant Unread Badge Increment (Only if the OTHER person sent it)
              if (payload.eventType === 'INSERT' && payload.new.sender_id !== currentUserId) {
                conv.unreadCount = (conv.unreadCount || 0) + 1;
              }

              newConvos[idx] = conv;

              // Re-sort: instantly bubble the active chat to the top of the sidebar list
              return newConvos.sort((a, b) => {
                const timeA = a.latestMessage ? new Date(a.latestMessage.created_at).getTime() : 0;
                const timeB = b.latestMessage ? new Date(b.latestMessage.created_at).getTime() : 0;
                return timeB - timeA;
              });
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, currentUserId]);

  const filteredConversations = useMemo(() => {
    return liveConversations.filter((c) => {
      // 3. THE CASE-SENSITIVITY BUG FIX
      // Server tag is "success", filter is "SUCCESS". We must force upper-case comparison!
      const activeTag = (c.roomTag || "negotiating").toUpperCase();
      const matchesFilter = filter === "ALL" || activeTag === filter;
      
      // Search Filter
      if (!searchTerm) return matchesFilter;

      const otherParticipant = c.participants?.find((p: any) => p.user_id !== currentUserId);
      const name = otherParticipant?.profile?.display_name?.toLowerCase() || "";
      const content = c.latestMessage?.content?.toLowerCase() || "";
      const subject = c.subject?.toLowerCase() || "";
      
      const matchesSearch = content.includes(searchTerm.toLowerCase()) || 
                            subject.includes(searchTerm.toLowerCase()) ||
                            name.includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [liveConversations, searchTerm, currentUserId, filter]);

  const bookingChats = filteredConversations.filter(c => c.conversation_type !== "support");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-[320px] border-r border-border flex flex-col bg-background shrink-0">
        
        <div className="p-4 pt-6 border-b border-border">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-1">
            <span className="h-px w-4 bg-primary" />
            <span className="text-primary font-bold text-[9px] uppercase tracking-[0.4em]">Dish Patch PH</span>
          </motion.div>
          <h2 className="text-xl font-black uppercase tracking-tight">The <span className="text-primary italic font-medium lowercase">inbox</span></h2>
        </div>
        
        <div className="px-4 py-3 border-b border-border space-y-3">
          <input 
            type="text" placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-b border-border py-1.5 text-xs focus:outline-none focus:border-primary transition-colors placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[9px] placeholder:font-bold"
          />
          
          {/* Dynamic Filter Tab Navigation */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
            {(["ALL", "NEGOTIATING", "SUCCESS", "CANCELLED"] as RoomStatus[]).map((tab) => (
              <button
                key={tab} onClick={() => setFilter(tab)}
                className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                  filter === tab 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
          <div className="space-y-4">
            
            {filter === "ALL" && (
              <div>
                <div className="text-[8px] uppercase tracking-[0.2em] font-mono font-bold text-muted-foreground/60 mb-1.5 px-2">HQ Concierge Lines</div>
                <Link href={`/messages/support`}>
                  <div className="p-3 border-b border-border/40 hover:bg-muted/50 transition-all cursor-pointer group bg-primary/5 rounded-lg mx-1">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif italic text-base shadow-md border border-primary/20 shrink-0">D</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate uppercase tracking-tighter text-primary">Concierge</p>
                        <p className="text-[10px] text-primary/70 truncate italic opacity-80 group-hover:opacity-100 transition-opacity">Official Support Line</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <div>
              <div className="text-[8px] uppercase tracking-[0.2em] font-mono font-bold text-muted-foreground/60 mb-1.5 px-2 mt-2">Secured Escrow Bookings</div>
              {bookingChats.length > 0 ? (
                bookingChats.map((chat) => (
                  <InboxItem key={chat.id} conversation={chat} currentUserId={currentUserId} />
                ))
              ) : (
                <div className="text-[10px] font-mono text-muted-foreground italic px-2 py-4 opacity-60 text-center">
                  No active queries match this filter.
                </div>
              )}
            </div>

          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden bg-muted/5 relative">
        {children}
      </main>
    </div>
  );
}