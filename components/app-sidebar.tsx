"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Calendar,
  CreditCard,
  HelpCircle,
  Settings,
  Utensils,
  Users,
  LogOut,
  User,
  Pencil
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"

type Role = "chef" | "user"

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = React.useState<any>(null)

  React.useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()

      if (data) setProfile(data)
    }

    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isActive = (href: string) => pathname === href

  const chefItems = [
    { label: "Dashboard", href: "/chef-dashboard", icon: LayoutDashboard },
    { label: "Requests", href: "/requests", icon: ClipboardList },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Partners", href: "/partners", icon: Users },
    { label: "Menu", href: "/menu", icon: Utensils },
  ]

  const userItems = [
    { label: "Dashboard", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "Requests", href: "/requests", icon: ClipboardList },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Payments", href: "/payments", icon: CreditCard },
  ]

  const bottomItems = [
    { label: "Help & Support", href: "/support", icon: HelpCircle },
    { label: "Account Settings", href: "/settings", icon: Settings },
  ]

  const items = role === "chef" ? chefItems : userItems

  return (
    <Sidebar collapsible="icon" className="bg-muted/40 border-r">
      {/* HEADER */}
      <SidebarHeader className="px-3 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold">App</span>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full justify-between">

        {/* ================= TOP SECTION ================= */}
        <div className="space-y-4">

          {/* PROFILE */}
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col gap-3 px-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">

                {/* PROFILE ROW */}
                <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">

                  <div className="h-9 w-9 shrink-0 rounded-full bg-background border flex items-center justify-center group-data-[collapsible=icon]:mx-auto">
                    <User size={16} />
                  </div>

                  <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                    {profile?.display_name || "User"}
                  </span>

                </div>

                {/* ACTIONS */}
                <SidebarMenu>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <Pencil size={16} />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Edit Profile
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut size={16} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Logout
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                </SidebarMenu>

              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* MAIN NAV */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="space-y-3 pb-4">

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </div>

      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  )
}