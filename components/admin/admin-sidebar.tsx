"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, LayoutDashboard, Package, MessageSquare, 
  LogOut, Search, Terminal, Image as ImageIcon, Sun, Moon, Home 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Package, label: "Admin Products", href: "/admin-products" },
    { icon: ImageIcon, label: "Admin Gallery", href: "/admin-gallery" },
    { icon: MessageSquare, label: "Inquiry Feed", href: "/admin-inquiries" },
  ];

  // Professional easing for a "heavy" but smooth feel
  const transition = { 
    type: "tween", 
    ease: [0.4, 0, 0.2, 1], 
    duration: 0.4 
  } as const;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={transition}
      className="relative h-screen bg-background border-r border-foreground/5 text-foreground z-[300] flex flex-col overflow-hidden select-none"
    >
      {/* 1. BRANDING & HOME ACTION */}
      <div className="flex flex-col border-b border-foreground/5">
        <div className="p-6 flex items-center h-20 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-primary flex items-center justify-center font-black text-primary-foreground text-xs shrink-0">
            D
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-4 text-[11px] font-black uppercase tracking-[0.4em] whitespace-nowrap"
              >
                Dishpatch <span className="text-primary italic font-serif lowercase">hq</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Link href="/">
          <div className="group flex items-center px-6 py-4 border-t border-foreground/5 hover:bg-foreground/[0.03] transition-colors cursor-pointer overflow-hidden">
            <Home className="min-w-[24px] h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap"
                >
                  Live Environment
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>

      {/* 2. NAVIGATION GRID */}
      <nav className="flex-1 py-8 flex flex-col gap-1 overflow-y-auto no-scrollbar overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "group flex items-center px-6 py-4 transition-all cursor-pointer relative overflow-hidden",
                isActive ? "bg-primary/5" : "hover:bg-foreground/[0.02]"
              )}>
                <item.icon className={cn(
                  "min-w-[24px] h-5 w-5 transition-all",
                  isActive ? "text-primary opacity-100" : "opacity-30 group-hover:opacity-100"
                )} />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className={cn(
                        "ml-6 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeBar"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
                    transition={transition}
                  />
                )}
              </div>
            </Link>
          );
        })}

        {/* Console Search */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 mt-10"
            >
              <div className="bg-foreground/[0.03] p-4 border border-foreground/5 space-y-3">
                <div className="flex items-center gap-2 opacity-30">
                  <Terminal size={10} />
                  <span className="text-[7px] font-black uppercase tracking-[0.2em]">Registry Search</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 opacity-20" />
                  <input 
                    placeholder="LOCATE ID..." 
                    className="w-full bg-transparent border-b border-foreground/10 pl-6 py-1 text-[10px] font-mono focus:outline-none focus:border-primary transition-colors uppercase"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 3. UTILITY FOOTER */}
      <div className="border-t border-foreground/5 p-4 bg-foreground/[0.01] overflow-hidden">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center px-4 py-3 hover:bg-foreground/5 transition-colors w-full group relative"
          >
            <div className="min-w-[24px] flex justify-center items-center">
              {theme === "dark" ? (
                <Sun size={16} className="text-primary animate-in fade-in zoom-in duration-300" />
              ) : (
                <Moon size={16} className="animate-in fade-in zoom-in duration-300" />
              )}
            </div>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-6 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {theme === "dark" ? "Luminescence" : "Dark Mode"}
              </motion.span>
            )}
          </button>
        )}

        <Link href="/">
          <div className="group flex items-center px-4 py-3 hover:bg-red-500/5 transition-colors cursor-pointer text-muted-foreground hover:text-red-500">
            <div className="min-w-[24px] flex justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-6 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                Exit Console
              </motion.span>
            )}
          </div>
        </Link>
      </div>

      {/* Floating Toggle Toggle (Cleaned Up) */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 bg-background border border-foreground/10 text-foreground w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all z-[301] rounded-none group"
      >
        <ChevronRight className={cn("h-3 w-3 transition-transform duration-500", isExpanded && "rotate-180")} />
      </button>
    </motion.aside>
  );
}