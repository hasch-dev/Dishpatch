"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, ClipboardList, MessageSquare, Calendar, 
  CreditCard, Settings, Utensils, Users, 
  LogOut, Pencil, ChevronLeft, ChefHat,
  Sun, Moon 
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppSidebar({ role }: { role: "chef" | "user" }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = React.useState<any>(null)
  const [mounted, setMounted] = React.useState(false)
  
  const { toggleSidebar, state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const items = role === "chef" ? [
    { label: "Dashboard", href: "/chef-dashboard", icon: LayoutDashboard },
    { label: "Requests", href: "/requests", icon: ClipboardList },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Partners", href: "/partners", icon: Users },
    { label: "Menu", href: "/menu", icon: Utensils },
  ] : [
    { label: "Dashboard", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments", href: "/payments", icon: CreditCard },
  ]

  return (
    <>
      {!isMobile && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "fixed z-[100] h-7 w-7 rounded-full border-2 border-border bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center p-0",
          )}
          style={{
            top: "50%",
            left: isCollapsed ? "calc(var(--sidebar-width-icon) - 14px)" : "calc(var(--sidebar-width) - 14px)",
            transform: "translateY(-50%)",
          }}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
        </Button>
      )}

      <Sidebar collapsible="icon" className="border-r border-border bg-sidebar shadow-xl">
        
        <SidebarHeader className="h-20 flex items-center bg-sidebar border-b border-border shrink-0 p-0 pt-4">
          <div className={cn(
            "flex w-full items-center transition-all duration-300 px-5",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-primary-foreground border border-border shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex flex-col items-start animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-serif text-[16px] tracking-widest uppercase text-sidebar-foreground leading-none">
                  Dish<span className="italic text-primary">patch</span>
                </span>
                <span className="text-[7px] uppercase tracking-[0.5em] text-muted-foreground font-bold mt-1.5 leading-none">
                  Private Dining
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-sidebar overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-0">
          
          {!isCollapsed && (
            <div className="px-6 py-5 pb-2">
              <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-1">Authenticated</p>
              <h3 className="text-lg font-serif italic text-sidebar-foreground truncate">
                {profile?.display_name || "Guest User"}
              </h3>
            </div>
          )}

          <SidebarGroup className="pt-2 px-0">
            <SidebarMenu className="gap-1">
              
              <div className={cn("flex items-center px-3 gap-1", isCollapsed ? "flex-col" : "flex-row")}>
                <SidebarMenuItem className="flex-1 group-data-[collapsible=icon]:px-0">
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Edit Profile"
                    className={cn(
                      "h-9 transition-all duration-200 flex items-center rounded-none",
                      isCollapsed 
                        ? "justify-center w-10 bg-accent text-accent-foreground" 
                        : "justify-start w-full px-3 bg-accent/50 text-sidebar-foreground hover:bg-accent border-l border-border"
                    )}
                  >
                    <Link href="/profile">
                      <Pencil className="h-3.5 w-3.5 shrink-0" />
                      {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-[0.2em] font-bold">Edit Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="group-data-[collapsible=icon]:px-0">
                  <SidebarMenuButton 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    tooltip="Toggle Theme"
                    className="h-9 w-10 flex items-center justify-center transition-all duration-200 rounded-none bg-accent/50 text-sidebar-foreground hover:bg-accent"
                  >
                    {mounted && (theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />)}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>

              <SidebarSeparator className="my-2.5 bg-border mx-4 group-data-[collapsible=icon]:mx-2" />

              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href} className="flex justify-center px-3 group-data-[collapsible=icon]:px-0">
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-10 transition-all duration-200 flex items-center rounded-none",
                        isCollapsed ? "justify-center w-10" : "justify-start w-full px-3",
                        isActive 
                          ? "bg-primary text-primary-foreground border-l-2 border-primary-foreground group-data-[collapsible=icon]:border-l-0" 
                          : "text-muted-foreground hover:bg-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0 transition-colors" />
                        {!isCollapsed && (
                          <span className="ml-3 text-[10px] uppercase tracking-[0.15em] font-bold">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="pb-6 bg-sidebar border-t border-border shrink-0 px-0">
          <SidebarMenu className="pt-4 gap-1">
            <SidebarMenuItem className="flex justify-center px-3 group-data-[collapsible=icon]:px-0">
              <SidebarMenuButton 
                asChild 
                tooltip="Settings"
                className={cn(
                  "h-9 transition-all duration-200 flex items-center rounded-none",
                  isCollapsed ? "justify-center w-10" : "justify-start w-full px-3 text-muted-foreground hover:bg-accent hover:text-sidebar-foreground"
                )}
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-widest font-bold">Settings</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem className="flex justify-center px-3 group-data-[collapsible=icon]:px-0 cursor-pointer">
              <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="Sign Out"
                className={cn(
                  "h-9 transition-all duration-200 flex items-center rounded-none",
                  isCollapsed ? "justify-center w-10" : "justify-start w-full px-3 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-widest font-bold">Sign Out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}