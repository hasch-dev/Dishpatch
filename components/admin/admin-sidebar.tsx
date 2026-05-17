"use client";

import { useState } from "react";
import { 
  ChevronRight, LayoutDashboard, Package, MessageSquare, 
  LogOut, Search, Terminal, Image as ImageIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Package, label: "Admin Products", href: "/admin-products" },
    { icon: ImageIcon, label: "Admin Gallery", href: "/admin-gallery" },
    { icon: MessageSquare, label: "Inquiry Feed", href: "/admin-inquiries" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? "90%" : "80px" }}
      className="relative h-screen bg-foreground border-r border-foreground/20 text-background z-[300] flex flex-col transition-all duration-500 ease-in-out"
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-12 bg-primary text-background p-1 rounded-sm hover:scale-110 transition-transform z-50"
      >
        <ChevronRight className={cn("h-4 w-4 transition-transform duration-500", isExpanded && "rotate-180")} />
      </button>

      {/* Top Branding */}
      <div className="p-6 flex items-center gap-4 border-b border-background/10">
        <div className="min-w-[32px] h-8 bg-primary flex items-center justify-center font-black text-foreground">D</div>
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs font-black uppercase tracking-[0.4em] whitespace-nowrap"
          >
            Dishpatch <span className="text-primary italic font-serif lowercase">hq</span>
          </motion.span>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-8 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="group flex items-center px-6 py-4 hover:bg-background/5 transition-colors cursor-pointer">
              <item.icon className="min-w-[24px] h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="ml-6 text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  {item.label}
                </motion.span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Expanded Terminal View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-12 py-12 border-t border-background/10"
          >
            <div className="max-w-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2 mb-6">
                <Terminal size={14} /> Global Registry Search
              </h4>
              <div className="bg-background/5 p-6 border border-background/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                  <input 
                    placeholder="LOCATE PRODUCT OR ASSET ID..." 
                    className="w-full bg-transparent border-b border-background/20 pl-12 py-3 text-xs font-mono focus:outline-none focus:border-primary transition-colors tracking-widest"
                  />
                </div>
                <p className="text-[8px] uppercase mt-4 opacity-30 tracking-[0.2em]">Enter product UUID or category tag</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropoff */}
      <div className="p-6 border-t border-background/10">
        <Link href="/">
          <div className="group flex items-center px-2 py-4 hover:bg-red-500/10 transition-colors cursor-pointer rounded-sm">
            <LogOut className="min-w-[24px] h-5 w-5 text-red-500" />
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="ml-6 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500"
              >
                Terminate Session
              </motion.span>
            )}
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}