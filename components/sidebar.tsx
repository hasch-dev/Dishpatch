"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Calendar,
  CreditCard,
  Users,
  Utensils,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

type Role = "chef" | "user";

export default function Sidebar({
  role,
  profile,
}: {
  role: Role;
  profile: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`border-r min-h-svh flex flex-col justify-between transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* TOP */}
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <p className="font-medium truncate">
                {profile?.display_name || "User"}
              </p>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </Button>
          </div>

          {!collapsed && (
            <div className="flex gap-2">
              <Link href="/profile">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </Link>

              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* MIDDLE */}
        <div className="p-3 space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={16} />}
            label="Dashboard"
            collapsed={collapsed}
            active={isActive("/dashboard")}
          />

          {role === "chef" && (
            <>
              <NavItem href="/analytics" icon={<BarChart3 size={16} />} label="Analytics" collapsed={collapsed} active={isActive("/analytics")} />
              <NavItem href="/requests" icon={<ClipboardList size={16} />} label="Requests" collapsed={collapsed} active={isActive("/requests")} badge={0} />
              <NavItem href="/messages" icon={<MessageSquare size={16} />} label="Messages" collapsed={collapsed} active={isActive("/messages")} badge={0} />
              <NavItem href="/calendar" icon={<Calendar size={16} />} label="Calendar" collapsed={collapsed} active={isActive("/calendar")} />
              <NavItem href="/billing" icon={<CreditCard size={16} />} label="Billing" collapsed={collapsed} active={isActive("/billing")} />
              <NavItem href="/partners" icon={<Users size={16} />} label="Partners" collapsed={collapsed} active={isActive("/partners")} />
              <NavItem href="/menu" icon={<Utensils size={16} />} label="Menu" collapsed={collapsed} active={isActive("/menu")} />
            </>
          )}

          {role === "user" && (
            <>
              <NavItem href="/requests" icon={<ClipboardList size={16} />} label="Requests" collapsed={collapsed} active={isActive("/requests")} badge={0} />
              <NavItem href="/messages" icon={<MessageSquare size={16} />} label="Messages" collapsed={collapsed} active={isActive("/messages")} badge={0} />
              <NavItem href="/calendar" icon={<Calendar size={16} />} label="Calendar" collapsed={collapsed} active={isActive("/calendar")} />
              <NavItem href="/billing" icon={<CreditCard size={16} />} label="Billing" collapsed={collapsed} active={isActive("/billing")} />
            </>
          )}
        </div>

        {/* BOTTOM */}
        <div className="p-3 border-t space-y-1">
          <NavItem href="/support" icon={<HelpCircle size={16} />} label="Support" collapsed={collapsed} active={isActive("/support")} />
          <NavItem href="/settings" icon={<Settings size={16} />} label="Settings" collapsed={collapsed} active={isActive("/settings")} />
        </div>
      </div>
    </TooltipProvider>
  );
}

function NavItem({
  href,
  icon,
  label,
  collapsed,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  badge?: number;
}) {
  const content = (
    <Link href={href}>
      <div
        className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition cursor-pointer ${
          active ? "bg-muted font-medium" : "hover:bg-muted"
        }`}
      >
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
        )}

        {icon}
        {!collapsed && <span>{label}</span>}

        {badge && badge > 0 && (
          <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}