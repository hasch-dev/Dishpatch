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
import { Switch } from "@/components/ui/switch" // Ensure you have this shadcn component
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  
  const [profile, setProfile] = React.useState<any>(null)
  const [role, setRole] = React.useState<"chef" | "user" | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  
  const { toggleSidebar, state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  React.useEffect(() => {
    setMounted(true)
    const loadIdentity = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, user_type")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        setRole(data.user_type as "chef" | "user")
      }
      setIsLoading(false)
    }
    loadIdentity()
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
    { label: "Partners", href: "/partners", icon: Users },
    { label: "Gastronomic Menu", href: "/menu", icon: Utensils },
  ] : [
    { label: "Dashboard", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments & Billing", href: "/payments", icon: CreditCard },
  ]

  if (isLoading || !mounted) return <div className="w-[var(--sidebar-width-icon)] h-full bg-sidebar border-r border-border" />

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

      <Sidebar collapsible="icon" className="border-r border-border bg-sidebar shadow-xl overflow-hidden">
        {/* Header */}
        <SidebarHeader className="h-20 flex flex-col justify-center bg-sidebar border-b border-border shrink-0 p-0">
          <div className={cn(
            "flex w-full items-center transition-all duration-300 px-4",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-primary-foreground border border-border">
              <ChefHat className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex flex-col items-start overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                <span className="font-serif text-[16px] tracking-widest uppercase text-foreground leading-tight">
                    Dish<span className="italic text-primary">patch</span>
                </span>
                <span className="text-[7px] uppercase tracking-[0.5em] text-muted-foreground font-bold">
                  Private Dining
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-sidebar custom-scrollbar">
          {!isCollapsed && (
            <div className="px-6 pt-8 pb-4 whitespace-nowrap overflow-hidden">
              <p className="text-[8px] uppercase tracking-[0.3em] text-primary font-bold mb-1">
                {role === 'chef' ? 'Artisan' : 'Client'}
              </p>
              <h3 className="text-xl font-serif italic text-foreground truncate">
                {profile?.display_name || "Guest User"}
              </h3>
            </div>
          )}

          <SidebarGroup className={cn("pt-2", isCollapsed ? "px-0" : "px-3")}>
            <SidebarMenu className="gap-2">
              
              {/* Profile & Theme Control */}
              <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col px-0" : "flex-row px-1")}>
                <SidebarMenuItem className="flex-1 w-full">
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Edit Profile"
                    className={cn(
                        "h-10 rounded-none bg-muted/30 hover:bg-accent transition-all flex items-center group/profile",
                        isCollapsed ? "justify-center px-0 mx-auto" : "justify-start px-3"
                    )}
                  >
                    <Link href="/profile" className="flex items-center w-full">
                      <Pencil className="h-4 w-4 shrink-0 text-muted-foreground group-hover/profile:text-accent-foreground" />
                      {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-[0.2em] font-bold">Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem className={isCollapsed ? "w-full" : "w-auto"}>
                    {isCollapsed ? (
                        <SidebarMenuButton 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                            className="h-10 w-full mx-auto flex items-center justify-center rounded-none bg-muted/30 group/theme"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                        </SidebarMenuButton>
                    ) : (
                        <div className="flex items-center gap-3 bg-muted/30 h-10 px-3 rounded-none border border-transparent">
                            <Moon className={cn("h-3 w-3", theme === "dark" ? "text-primary" : "text-muted-foreground")} />
                            <Switch 
                                checked={theme === "light"}
                                onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
                                className="scale-75 data-[state=checked]:bg-primary"
                            />
                            <Sun className={cn("h-3 w-3", theme === "light" ? "text-primary" : "text-muted-foreground")} />
                        </div>
                    )}
                </SidebarMenuItem>
              </div>

              <SidebarSeparator className="my-2 mx-2 opacity-50" />

              {/* Navigation Items */}
              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 flex items-center rounded-none transition-all duration-200 group/nav relative",
                        isActive 
                          ? "bg-primary/10 text-primary border-l-4 border-primary" 
                          : "border-l-4 border-transparent hover:bg-muted text-muted-foreground",
                        isCollapsed ? "justify-center px-0 mx-1.5" : "justify-start px-4"
                      )}
                    >
                      <Link href={item.href} className="flex items-center w-full">
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-colors mx-auto", // mx-auto ensures centering in collapsed state
                          !isCollapsed && "mx-0",
                          isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground"
                        )} />
                        {!isCollapsed && (
                            <span className={cn(
                                "ml-4 text-[10px] uppercase tracking-[0.2em] font-bold truncate",
                                isActive ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
                            )}>
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

        <SidebarFooter className={cn("pb-8 border-t border-border bg-sidebar", isCollapsed ? "px-0" : "px-3")}>
          <SidebarMenu className="pt-6 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings" 
                className={cn(
                  "h-10 border-l-4 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all group/settings",
                  isCollapsed ? "justify-center px-0 mx-1.5" : "justify-start px-4"
                )}
              >
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="h-4 w-4 shrink-0 mx-auto" style={!isCollapsed ? {marginInline: 0} : {}} />
                  {!isCollapsed && <span className="ml-4 text-[10px] uppercase tracking-widest font-bold">Settings</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="Sign Out"
                className={cn(
                  "h-10 border-l-4 border-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer group/logout",
                  isCollapsed ? "justify-center px-0 mx-1" : "justify-start px-4"
                )}
              >
                <div className="flex items-center w-full">
                  <LogOut className="h-4 w-4 shrink-0 mx-auto" style={!isCollapsed ? {marginInline: 0} : {}} />
                  {!isCollapsed && <span className="ml-4 text-[10px] uppercase tracking-widest font-bold">Sign Out</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}