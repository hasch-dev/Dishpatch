"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, ClipboardList, MessageSquare, Calendar, 
  CreditCard, HelpCircle, Settings, Utensils, Users, 
  LogOut, User, Pencil, ChevronLeft
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

export function AppSidebar({ role }: { role: "chef" | "user" }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = React.useState<any>(null)
  
  const { toggleSidebar, state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  React.useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [])

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
      {/* TRIGGER */}
      {!isMobile && (
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className="fixed z-[60] h-8 w-8 rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-110"
          style={{
            top: "50%",
            left: `calc(${isCollapsed ? "var(--sidebar-width-icon)" : "var(--sidebar-width)"} + 4px)`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
        </Button>
      )}

      <Sidebar collapsible="icon" className="border-r">
        {/* HEADER */}
        <SidebarHeader className="h-16 flex items-center justify-center border-b">
          <div className="flex w-full items-center px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="font-bold text-sm">D</span>
            </div>
            <span className="ml-3 font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              DishPatch
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-x-hidden">
          {/* PROFILE SECTION */}
          <SidebarGroup className="py-6">
            <div className="flex flex-col w-full items-center">
              <div className="flex w-full items-center px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted border flex items-center justify-center shadow-inner">
                  <User size={20} className="text-muted-foreground" />
                </div>
                <div className="ml-3 flex flex-col overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  <span className="text-sm font-semibold leading-none truncate w-[140px]">
                    {profile?.display_name || "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">{role}</span>
                </div>
              </div>
            </div>
            
            <SidebarMenu className="mt-6 px-2 group-data-[collapsible=icon]:px-0">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Edit Profile"
                  className="group-data-[collapsible=icon]:justify-start"
                >
                  <Link href="/profile">
                    <Pencil className="h-4 w-4 shrink-0" />
                    <span>Edit Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout} 
                  tooltip="Logout"
                  className="group-data-[collapsible=icon]:justify-start"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          {/* NAV ITEMS */}
          <SidebarGroup>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="group-data-[collapsible=icon]:justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="pb-4">
          <SidebarSeparator className="mb-4" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings"
                className="group-data-[collapsible=icon]:justify-start"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}