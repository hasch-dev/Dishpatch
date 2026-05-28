"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, LayoutDashboard, Package, LogOut, 
  Sun, Moon, Home, Boxes, Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminSidebarProps {
  adminEmail?: string;
}

export default function AdminSidebar({ adminEmail = "admin@dishpatch.com" }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "Operations": false,
    "Content & Relations": false
  });

  useEffect(() => setMounted(true), []);

  // Split data arrays to achieve perfect layout isolation
  const mainNavData = [
    {
      heading: "Main",
      items: [
        { icon: LayoutDashboard, label: "Overview", href: "/admin-dashboard" },
        {
          icon: Boxes,
          label: "Operations",
          children: [
            { label: "Distributions", href: "/distributions" },
            { label: "Inventory Ledger", href: "/inventory" },
          ]
        },
        {
          icon: Package,
          label: "Content & Relations",
          children: [
            { label: "Admin Gallery", href: "/admin-gallery" },
            { label: "Admin Products", href: "/admin-products" },
            { label: "Inquiry Feed", href: "/admin-inquiries" },
            { label: "Shared Moments", href: "/admin-testimonials" },
          ]
        }
      ]
    }
  ];

  const bottomNavData = [
    {
      heading: "System Configurations",
      items: [
        { icon: Code, label: "Dev Home Page", href: "/" },
        { icon: Home, label: "Live Website", href: "https://dishpatch-delta.vercel.app/" },
        { 
          icon: mounted && theme === "dark" ? Sun : Moon, 
          label: "Toggle Theme", 
          onClick: () => setTheme(theme === "dark" ? "light" : "dark") 
        },
        { icon: LogOut, label: "Log Out", href: "/auth/logout", danger: true }
      ]
    }
  ];

  useEffect(() => {
    mainNavData.forEach(group => {
      group.items.forEach(item => {
        if (item.children?.some(child => child.href === pathname)) {
          setOpenDropdowns(prev => ({ ...prev, [item.label]: true }));
        }
      });
    });
  }, [pathname]);

  const toggleDropdown = (label: string) => {
    if (!isExpanded) setIsExpanded(true); 
    setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const transition = { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 };

  // Shared renderer to guarantee identical design specs for both zones
  const renderItemContent = (item: any, isActiveParent: boolean, isDropdownOpen?: boolean) => (
    <>
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        isActiveParent ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
        item.danger && "group-hover:text-destructive"
      )} />
      
      <motion.span 
        animate={{ opacity: isExpanded ? 1 : 0, display: isExpanded ? "block" : "none" }}
        className="ml-4 text-[13px] font-medium whitespace-nowrap flex-1 text-left"
      >
        {item.label}
      </motion.span>

      {item.children && isExpanded && (
        <motion.div
          animate={{ rotate: isDropdownOpen ? -180 : 0 }}
          className="opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.div>
      )}

      {!isExpanded && (
        <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-2 bg-foreground text-background text-[12px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl flex items-center">
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-foreground" />
          {item.label}
        </div>
      )}
    </>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 260 : 80 }}
      transition={transition}
      className="relative h-screen bg-background border-r border-border font-sans text-foreground z-[300] flex flex-col select-none shrink-0 overflow-hidden"
    >
      {/* BRAND IDENTITY HEADER (STATIC) */}
      <div className="flex items-center px-5 pt-6 pb-4 whitespace-nowrap overflow-hidden h-16 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground shrink-0 shadow-sm">
          D
        </div>
        <motion.div 
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
          className="ml-3 flex flex-col justify-center overflow-hidden"
        >
          <span className="text-[13px] font-semibold text-foreground leading-none truncate max-w-[170px]">
            {adminEmail}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium mt-1.5 leading-none">
            Admin Console
          </span>
        </motion.div>
      </div>

      {/* ZONE 1: PRIMARY SCROLLABLE INTERFACE (WITH INTEGRATED ULTRA-THIN SCROLLBAR OVERLAYS) */}
      <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-6 style-scrollbar style-firefox-scrollbar">
        <style jsx global>{`
          /* Non-intrusive custom engine tracking configs */
          .style-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          .style-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .style-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(var(--foreground-rgb, 0, 0, 0), 0.08);
            border-radius: 100px;
          }
          .style-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(var(--foreground-rgb, 0, 0, 0), 0.16);
          }
          /* Firefox Engine Mapping */
          .style-firefox-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
          }
        `}</style>

        {mainNavData.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            <motion.div 
              animate={{ opacity: isExpanded ? 1 : 0 }}
              className={cn(
                "px-4 mb-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest whitespace-nowrap overflow-hidden",
                !isExpanded && "h-0 mb-0 opacity-0"
              )}
            >
              {group.heading}
            </motion.div>

            {group.items.map((item, itemIdx) => {
              const isActiveParent = pathname === item.href || item.children?.some(c => c.href === pathname);
              const isDropdownOpen = openDropdowns[item.label];

              return (
                <div key={itemIdx} className="flex flex-col relative group">
                  {item.children ? (
                    <button 
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl transition-all relative w-full cursor-pointer",
                        isDropdownOpen && !isActiveParent ? "bg-muted/40" : "",
                        isActiveParent && !isDropdownOpen
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "text-foreground hover:bg-muted/80"
                      )}
                    >
                      {renderItemContent(item, isActiveParent, isDropdownOpen)}
                    </button>
                  ) : (
                    <Link href={item.href || "#"} className={cn(
                      "flex items-center px-4 py-3 rounded-xl transition-all relative w-full cursor-pointer",
                      isActiveParent 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-foreground hover:bg-muted/80"
                    )}>
                      {renderItemContent(item, isActiveParent)}
                    </Link>
                  )}

                  {item.children && (
                    <AnimatePresence>
                      {isDropdownOpen && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden relative ml-6 mt-1"
                        >
                          <div className="absolute left-[11px] top-0 bottom-4 w-px bg-border" />
                          
                          <div className="flex flex-col gap-1 py-1 pl-6 relative">
                            {item.children.map((child, childIdx) => {
                              const isChildActive = pathname === child.href;
                              
                              return (
                                <Link key={childIdx} href={child.href} className="relative">
                                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-px bg-border" />
                                  
                                  <div className={cn(
                                    "px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                                    isChildActive 
                                      ? "bg-primary text-primary-foreground shadow-sm" 
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  )}>
                                    {child.label}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ZONE 2: DECOUPLED STICKY CONFIGURATION SYSTEM (ANCHOURED AT FOOTER BASE) */}
      <div className="mt-auto border-t border-border/60 p-4 flex flex-col gap-1 bg-background shrink-0">
        {bottomNavData.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            <motion.div 
              animate={{ opacity: isExpanded ? 1 : 0 }}
              className={cn(
                "px-4 mb-2 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap overflow-hidden",
                !isExpanded && "h-0 mb-0 opacity-0"
              )}
            >
              {group.heading}
            </motion.div>

            {group.items.map((item, itemIdx) => {
              const isActive = pathname === item.href;

              return (
                <div key={itemIdx} className="flex flex-col relative group">
                  {item.onClick ? (
                    <button 
                      onClick={item.onClick}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl transition-all relative w-full cursor-pointer text-foreground hover:bg-muted/80",
                        item.danger && "hover:bg-destructive/10 hover:text-destructive"
                      )}
                    >
                      {renderItemContent(item, false)}
                    </button>
                  ) : (
                    <Link href={item.href || "#"} className={cn(
                      "flex items-center px-4 py-3 rounded-xl transition-all relative w-full cursor-pointer",
                      isActive 
                        ? "bg-muted text-foreground font-semibold" 
                        : "text-foreground hover:bg-muted/80",
                      item.danger && "hover:bg-destructive/10 hover:text-destructive"
                    )}>
                      {renderItemContent(item, false)}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* SIDEBAR TOGGLE MECHANISM */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3.5 top-10 bg-background border border-border text-muted-foreground hover:text-foreground w-7 h-7 flex items-center justify-center shadow-md rounded-lg group transition-all z-[301] cursor-pointer hover:bg-muted"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !isExpanded && "rotate-180")} />
      </button>
    </motion.aside>
  );
}