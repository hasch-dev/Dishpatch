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
    { label: "Messages", href: "/chef/messages", icon: MessageSquare }, // Fixed Chef path
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Partners", href: "/partners", icon: Users },
    { label: "Gastronomic Menu", href: "/menu", icon: Utensils },
  ] : [
    { label: "Dashboard", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/user/messages", icon: MessageSquare }, // Fixed User path
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments & Billing", href: "/payments", icon: CreditCard }, // Updated label
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
        {/* Header - Brand Colors */}
        <SidebarHeader className="h-20 flex justify-center bg-sidebar border-b border-border shrink-0 p-0">
          <div className={cn(
            "flex w-full items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "px-6 justify-start"
          )}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-primary-foreground border border-border">
              <ChefHat className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex flex-col items-start overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                <span className="font-serif text-[16px] tracking-widest uppercase text-foreground">
                    Dish<span className="italic text-primary">patch</span>
                </span>
                <span className="text-[7px] uppercase tracking-[0.5em] text-muted-foreground font-bold mt-1">
                  Private Dining
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-sidebar">
          {/* User Profile Info */}
          {!isCollapsed && (
            <div className="px-6 pt-6 pb-2 whitespace-nowrap overflow-hidden">
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
              
              {/* Profile & Theme Control Section */}
              <div className={cn("flex gap-2", isCollapsed ? "flex-col" : "flex-row")}>
                <SidebarMenuItem className="flex-1">
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Edit Profile"
                    className="h-10 rounded-none bg-muted/50 hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center group/profile"
                  >
                    <Link href="/profile" className="flex items-center w-full justify-center">
                      <Pencil className="h-4 w-4 shrink-0 text-muted-foreground group-hover/profile:text-accent-foreground transition-colors" />
                      {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-[0.2em] font-bold w-full">Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    tooltip="Toggle Theme"
                    className={cn(
                      "h-10 flex items-center justify-center rounded-none bg-muted/50 hover:bg-accent hover:text-accent-foreground transition-all group/theme",
                      isCollapsed ? "w-full" : "w-12"
                    )}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 shrink-0 text-muted-foreground group-hover/theme:text-accent-foreground transition-colors" />
                    ) : (
                      <Moon className="h-4 w-4 shrink-0 text-muted-foreground group-hover/theme:text-accent-foreground transition-colors" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>

              <SidebarSeparator className="my-3 mx-2 opacity-50 bg-border" />

              {/* Main Nav Items - ACTIVE Logic Applied */}
              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-12 flex items-center rounded-none transition-all duration-200 group/nav",
                        isActive 
                          ? "bg-primary border-l-4 border-primary-foreground shadow-inner" 
                          : "border-l-4 border-transparent hover:bg-muted text-muted-foreground",
                        isCollapsed ? "justify-center px-0" : "justify-start px-4"
                      )}
                    >
                      <Link href={item.href} className="flex items-center w-full">
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-colors", 
                          // ACTIVE: Uses 'foreground' (Lighter in Dark Mode, Darker in Light Mode)
                          isActive ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
                        )} />
                        {!isCollapsed && (
                            <span className={cn(
                                "ml-4 text-[10px] uppercase tracking-[0.2em] font-bold truncate transition-colors",
                                // ACTIVE: Same logic for text
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

        <SidebarFooter className={cn("pb-8 border-t border-border", isCollapsed ? "px-0" : "px-3")}>
          <SidebarMenu className="pt-4 gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings" 
                className={cn(
                  "h-10 border-l-4 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all group/settings",
                  isCollapsed ? "justify-center px-0" : "justify-start px-4"
                )}
              >
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover/settings:text-foreground transition-colors" />
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
                  isCollapsed ? "justify-center px-0" : "justify-start px-4"
                )}
              >
                <div className="flex items-center w-full">
                  <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover/logout:text-destructive transition-colors" />
                  {!isCollapsed && <span className="ml-6 text-[10px] uppercase tracking-widest font-bold">Sign Out</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}