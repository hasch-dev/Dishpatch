"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, ClipboardList, MessageSquare, Calendar, 
  CreditCard, Settings, Utensils, Users, 
  LogOut, Pencil, ChevronLeft,
  Sun, Moon, X, ArrowLeft
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
import { Switch } from "@/components/ui/switch" 
import { cn } from "@/lib/utils"
import LogoTextLight from "./logo-text-light"
import LogoTextDark from "./logo-text-dark"
import Logo from '@/components/logo-dispatch'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  
  const [profile, setProfile] = React.useState<any>(null)
  const [role, setRole] = React.useState<"chef" | "user" | null>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [unreadMsg, setUnreadMsg] = React.useState(false)
  const [messageToast, setMessageToast] = React.useState<{senderName: string, text: string, chatId: string} | null>(null)
  
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
      setUserId(user.id)

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

  // Message listener effect remains same...
  React.useEffect(() => {
    if (!userId) return
    let isMounted = true
    let channel: any = null
    const setupListener = async () => {
      const { data: convos } = await supabase.from("conversations").select("id").or(`chef_id.eq.${userId},client_id.eq.${userId}`)
      if (!isMounted) return
      const convoIds = convos?.map(c => c.id) || []
      channel = supabase.channel(`global_messages_${userId}`)
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload: any) => {
          const newMsg = payload.new
          if (convoIds.includes(newMsg.conversation_id) && newMsg.sender_id !== userId && !pathname.includes(newMsg.conversation_id)) {
            setUnreadMsg(true)
            const { data: senderProfile } = await supabase.from('profiles').select('display_name').eq('id', newMsg.sender_id).single()
            if (isMounted) {
              setMessageToast({ senderName: senderProfile?.display_name || "Someone", text: newMsg.content, chatId: newMsg.conversation_id })
              setTimeout(() => { if (isMounted) setMessageToast(null) }, 5000)
            }
          }
        }).subscribe()
    }
    setupListener()
    return () => { isMounted = false; if (channel) supabase.removeChannel(channel) }
  }, [userId, supabase, pathname])

  React.useEffect(() => {
    if (pathname.includes('/messages')) setUnreadMsg(false)
  }, [pathname])

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

  // Helper to determine if we're on the public side vs dashboard side
  const isPublicPage = pathname === "/" || pathname === "/gallery" || pathname === "/products"
  const dashboardHref = role === "chef" ? "/chef-dashboard" : "/user-dashboard"

  if (isLoading || !mounted) return <div className="w-[var(--sidebar-width-icon)] h-full bg-sidebar border-r border-border" />

  return (
    <>
      {/* Toast and Toggle Button remain same... */}
      <AnimatePresence>
        {messageToast && (
          <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className="fixed bottom-6 right-6 z-[200] bg-card border border-border shadow-2xl p-5 w-[350px] cursor-pointer" onClick={() => { router.push(`/messages/${messageToast.chatId}`); setMessageToast(null); }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1">New Message from</p>
                <h4 className="font-serif italic text-lg leading-tight truncate">{messageToast.senderName}</h4>
                <p className="text-xs text-muted-foreground mt-2 truncate font-light">"{messageToast.text}"</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setMessageToast(null); }} className="hover:bg-muted p-1 rounded-sm transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isMobile && (
        <Button variant="secondary" size="icon" onClick={toggleSidebar} className={cn("fixed z-[100] h-7 w-7 rounded-full border-2 border-border bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center p-0")} style={{ top: "50%", left: isCollapsed ? "calc(var(--sidebar-width-icon) - 14px)" : "calc(var(--sidebar-width) - 14px)", transform: "translateY(-50%)" }}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
        </Button>
      )}

      <Sidebar collapsible="icon" className="border-r border-border bg-sidebar shadow-xl overflow-hidden">
        <SidebarHeader className="h-16 flex flex-col justify-center bg-sidebar border-b border-border shrink-0 p-0 relative overflow-hidden group/header">
          <div className={cn("flex w-full items-center transition-all duration-300 px-6", isCollapsed ? "justify-center px-0" : "justify-start")}>
            {/* DYNAMIC LOGO LINK: If on Public, go to Dashboard. If on Dashboard, go to Public. */}
            <Link 
              href={isPublicPage ? dashboardHref : "/"} 
              className={cn("flex items-center h-8 group transition-all duration-500", isCollapsed && "justify-center w-full")}
            >
              <div className="relative">
                <Logo width={32} height={32} className="transition-transform duration-500 group-hover/header:scale-90" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm my-auto rounded-full opacity-0 group-hover/header:opacity-100 transition-opacity">
                  {isPublicPage ? <LayoutDashboard size={14} className="text-primary" /> : <ArrowLeft size={14} className="text-primary" />}
                </div>
              </div>

              {!isCollapsed && (
                <div className="flex flex-col ml-3">
                  <div className="flex flex-row items-center mt-2.5 justify-center animate-in fade-in slide-in-from-left-2 duration-500">
                    <span className="text-sm w-32 flex items-center justify-center h-4 justify-center font-bold uppercase tracking-tighter text-foreground italic">
                      {mounted && (theme === "dark" ? <LogoTextLight /> : <LogoTextDark className="mb-1"/>)}
                    </span>
                    <p className="px-1 font-black text-xs">PH</p>
                  </div>
                  <span className="text-[7px] uppercase tracking-[0.4em] text-primary font-bold opacity-0 -translate-y-2 group-hover/header:opacity-100 group-hover/header:translate-y-0 transition-all duration-300">
                    {isPublicPage ? `Enter ${role === 'chef' ? 'Atelier' : 'Suite'}` : 'Back to Home'}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </SidebarHeader>

        {/* The rest of SidebarContent, Group, and Footer stay exactly as you had them */}
        <SidebarContent className="bg-sidebar custom-scrollbar h-auto">
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
          {/* ... existing sidebar groups and menus ... */}
          <SidebarGroup className={cn("pt-2", isCollapsed ? "px-0" : "px-3")}>
            <SidebarMenu className="gap-2">
              <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col px-0" : "flex-row px-1")}>
                <SidebarMenuItem className="flex-1 w-full">
                  <SidebarMenuButton asChild tooltip="Edit Profile" className={cn("h-8 w-full rounded-none bg-muted/30 hover:bg-primary transition-all flex items-center group/profile", isCollapsed ? "justify-center px-0 mx-auto" : "justify-start px-3")}>
                    <Link href="/profile" className="flex items-center w-full">
                      <Pencil className="h-4 w-4 shrink-0 text-muted-foreground group-hover/profile:text-accent-foreground" />
                      {!isCollapsed && <span className="ml-3 text-[10px] uppercase tracking-[0.2em] font-bold group-hover/profile:text-accent-foreground">Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="w-full">
                    {isCollapsed ? (
                        <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-10 w-full mx-auto flex items-center justify-center rounded-none bg-muted/30">
                            {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                        </SidebarMenuButton>
                    ) : (
                        <div className="flex items-center gap-3 bg-muted/30 h-10 px-3 rounded-none border border-transparent">
                            <Moon className={cn("h-3 w-3", theme === "dark" ? "text-primary" : "text-muted-foreground")} />
                            <Switch checked={theme === "light"} onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")} className="scale-75 data-[state=checked]:bg-primary" />
                            <Sun className={cn("h-3 w-3", theme === "light" ? "text-primary" : "text-muted-foreground")} />
                        </div>
                    )}
                </SidebarMenuItem>
              </div>
              <SidebarSeparator className="my-2 mx-2 opacity-50" />
              {items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const isMessageNav = item.href === '/messages'
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn("h-8 flex items-center rounded-none transition-all duration-200 group/nav relative", isActive ? "bg-primary/10 text-primary border-l-4 border-primary" : "border-l-4 border-transparent hover:bg-muted text-muted-foreground", isCollapsed ? "justify-center px-0 mx-1.5" : "justify-start px-4")}>
                      <Link href={item.href} className="flex items-center w-full relative">
                        <div className={cn("relative mx-auto", !isCollapsed && "mx-0")}>
                          <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground")} />
                          {isMessageNav && unreadMsg && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 shadow-sm ring-2 ring-sidebar" />}
                        </div>
                        {!isCollapsed && <span className={cn("ml-4 text-[10px] uppercase tracking-[0.2em] font-bold truncate flex-1", isActive ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground")}>{item.label}</span>}
                        {!isCollapsed && isMessageNav && unreadMsg && <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">New</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className={cn("pb-4 border-t border-border bg-sidebar", isCollapsed ? "px-0" : "px-3")}>
          <SidebarMenu className="pt-2 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" className={cn("h-10 border-l-4 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all group/settings", isCollapsed ? "justify-center px-0 mx-1.5" : "justify-start px-4")}>
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="h-4 w-4 shrink-0 mx-auto" style={!isCollapsed ? {marginInline: 0} : {}} />
                  {!isCollapsed && <span className="ml-4 text-[10px] uppercase tracking-widest font-bold">Settings</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out" className={cn("h-10 border-l-4 border-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer group/logout", isCollapsed ? "justify-center px-0 mx-1" : "justify-start px-4")}>
                <div className="flex items-center w-full">
                  <LogOut className="h-4 w-4 shrink-0 mx-auto" style={!isCollapsed ? {marginInline: 0} : {}} />
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