"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ShieldCheck, Users2, UtensilsCrossed, 
  Database, LayoutGrid, LogOut, ChevronDown
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const ADMIN_NAV = [
  {
    title: "Operations",
    icon: LayoutGrid,
    items: [
      { label: "Main Command", href: "/admin/dashboard" },
      { label: "Active Requests", href: "/admin/requests" },
      { label: "Inquiry Desk", href: "/admin/inquiries" },
    ]
  },
  {
    title: "Network Management",
    icon: Users2,
    items: [
      { label: "Manage Partners", href: "/admin/partners" },
      { label: "Chef Directory", href: "/admin/users/chefs" },
      { label: "Client Database", href: "/admin/users/clients" },
    ]
  },
  {
    title: "Global Content",
    icon: UtensilsCrossed,
    items: [
      { label: "Menu Master List", href: "/admin/catalog" },
      { label: "Global Gallery", href: "/admin/gallery" },
    ]
  },
  {
    title: "System Logs",
    icon: Database,
    items: [
      { label: "Transaction Logs", href: "/admin/finance" },
      { label: "Security & RLS", href: "/admin/system/security" },
      { label: "Server Status", href: "/admin/system/health" },
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-zinc-950 text-zinc-400">
      {/* Brand Header */}
      <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-white/5 bg-zinc-950">
        <ShieldCheck className="text-primary shrink-0" size={20} />
        {!isCollapsed && (
          <div className="ml-3 animate-in fade-in slide-in-from-left-2 duration-500">
            <p className="text-[10px] font-black uppercase tracking-[.3em] text-primary leading-none">System Admin</p>
            <p className="text-[7px] uppercase tracking-widest opacity-40 mt-1">Root Access v16.2</p>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="py-6 custom-scrollbar bg-zinc-950">
        {ADMIN_NAV.map((group) => (
          <SidebarGroup key={group.title} className="px-3">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem className="list-none">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="hover:bg-white/5 hover:text-white transition-colors py-5">
                    <group.icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 text-[10px] uppercase font-black tracking-widest flex-1 text-left">
                          {group.title}
                        </span>
                        <ChevronDown size={14} className="opacity-20 group-data-[state=open]/collapsible:rotate-180 transition-transform" />
                      </>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarMenu className={cn(
                    "mt-1 space-y-1", 
                    !isCollapsed && "ml-4 border-l border-white/5 pl-2"
                  )}>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className={cn(
                              "h-8 rounded-none transition-all duration-200",
                              isActive 
                                ? "bg-primary/10 text-primary font-bold" 
                                : "hover:bg-white/5 hover:text-primary opacity-60 hover:opacity-100"
                            )}
                          >
                            <Link href={item.href} className="text-[9px] uppercase tracking-[0.2em]">
                              {item.label}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* System Footer */}
      <SidebarFooter className="p-4 border-t border-white/5 bg-zinc-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-none">
              <LogOut size={16} />
              {!isCollapsed && <span className="ml-3 text-[10px] uppercase font-black tracking-widest">Terminate Session</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}