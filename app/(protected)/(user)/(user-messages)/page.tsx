'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Send, ChefHat, Calendar, Info, 
  Search, Paperclip, MoreHorizontal, 
  ChevronLeft, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock Data Structure
const MOCK_CHATS = [
  {
    id: 'chat-1',
    booking_title: 'Late Summer Soirée',
    chef_name: 'Chef Julianna',
    chef_avatar: 'JP',
    last_message: "I've secured the micro-greens for the starter.",
    timestamp: '2:45 PM',
    unread: true,
    is_assigned: true,
    event_date: 'Sept 14'
  },
  {
    id: 'chat-2',
    booking_title: 'Anniversary Dinner',
    chef_name: 'Unassigned',
    chef_avatar: '?',
    last_message: null,
    timestamp: null,
    unread: false,
    is_assigned: false,
    event_date: 'Oct 02'
  }
]

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0])
  const [message, setMessage] = useState("")

  return (
    <div className="flex h-[calc(100-screen-3.5rem)] bg-white overflow-hidden">
      
      {/* 1. CHAT LIST SIDEBAR */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-[#FAFAFA]">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="font-serif text-xl italic mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input 
              placeholder="Search engagements..." 
              className="pl-9 h-9 text-xs bg-slate-50 border-none rounded-none focus-visible:ring-1 focus-visible:ring-slate-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={cn(
                "p-5 cursor-pointer border-b border-slate-50 transition-all relative",
                activeChat.id === chat.id ? "bg-white border-r-2 border-r-slate-900" : "hover:bg-slate-50"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {chat.event_date}
                </span>
                {chat.unread && <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />}
              </div>
              <h3 className="font-serif text-sm font-medium text-slate-900 truncate">{chat.booking_title}</h3>
              <p className="text-[11px] text-slate-500 italic mt-1 truncate">
                {chat.is_assigned ? chat.chef_name : 'Curation in progress...'}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <section className="flex-1 flex flex-col bg-white">
        {activeChat.is_assigned ? (
          <>
            {/* CHAT HEADER */}
            <header className="h-16 border-b border-slate-100 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {activeChat.chef_avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">{activeChat.chef_name}</h4>
                  <p className="text-[10px] text-slate-400 italic">Direct Line • {activeChat.booking_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* MESSAGE FEED */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Receiver */}
              <div className="flex flex-col gap-2 max-w-[70%]">
                <div className="bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs leading-relaxed text-slate-700">
                    Good morning! I've finalized the sourcing for the Late Summer Soirée. We'll be moving forward with the heirloom tomatoes from the local farm as discussed. 
                  </p>
                </div>
                <span className="text-[8px] uppercase tracking-widest font-bold text-slate-300">Chef Julianna • 10:30 AM</span>
              </div>

              {/* Sender */}
              <div className="flex flex-col gap-2 max-w-[70%] ml-auto items-end">
                <div className="bg-slate-900 p-4">
                  <p className="text-xs leading-relaxed text-white">
                    That sounds perfect. Do we have the pairing list for the wine yet?
                  </p>
                </div>
                <span className="text-[8px] uppercase tracking-widest font-bold text-slate-300">You • 10:45 AM</span>
              </div>
            </div>

            {/* INPUT AREA */}
            <footer className="p-6 border-t border-slate-100">
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2">
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message to your artisan..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs italic py-2 outline-none"
                />
                <Button 
                  className="bg-transparent hover:bg-transparent text-slate-900 p-0 h-auto"
                  disabled={!message}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </footer>
          </>
        ) : (
          /* 3. LOCKED STATE: NO CHEF ASSIGNED */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFDFD] p-12 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-6 w-6 text-slate-200" />
            </div>
            <h3 className="font-serif text-2xl italic text-slate-800 mb-3">Line Restricted</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mx-auto">
              Direct messaging will be activated once an artisan has been assigned to your 
              <span className="font-bold text-slate-700"> {activeChat.booking_title}</span>. 
              Our concierge team is currently vetting the best talent.
            </p>
            <Button variant="outline" className="mt-8 rounded-none text-[9px] uppercase tracking-widest font-bold border-slate-200 text-slate-400">
              View Vetting Progress
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}