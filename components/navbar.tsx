"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, User, LayoutDashboard, ArrowRight, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; 
import Logo from "./logo-dispatch";
import LogoTextDark from './logo-text-dark';
import LogoTextLight from './logo-text-light';
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null); 
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    const loadIdentity = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", authUser.id)
          .single();
        setRole(data?.user_type || null);
      }
    };
    loadIdentity();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      
      if (sessionUser) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", sessionUser.id)
          .single();
        setRole(data?.user_type || null);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Determine the correct dashboard path and label based on role
  const getDashboardConfig = () => {
    switch (role) {
      case "admin":
        return { path: "/admin-dashboard", label: "Dashboard", subLabel: "Console" };
      case "chef":
        return { path: "/chef-dashboard", label: "Dashboard", subLabel: "Artisan" };
      default:
        return { path: "/user-dashboard", label: "Dashboard", subLabel: "Client" };
    }
  };

  const { path: dashboardPath, label, subLabel } = getDashboardConfig();

  const navigationItems = [
    { label: "Our Story", href: "/#about" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Process", href: "/#how-it-works" },
    { label: "Gallery", href: "/gallery" }, 
    { label: "Gift an Evening", href: "/#gift" },
  ];

  return (
    <header className="font-serif sticky top-0 z-50 flex items-center justify-between h-16 border-b border-border/40 bg-background/95 backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto w-full px-4 lg:px-8">
        <div className="flex w-full h-16 gap-4 items-center">
          
          {/* Logo Section */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center h-8 group transition-opacity hover:opacity-80">
              <Logo width={32} height={32} />
              <div className="hidden sm:flex flex-row items-center ml-2">
                <span className="w-32 text-sm font-bold uppercase tracking-tighter text-foreground italic">
                  {mounted && (theme === "dark" ? <LogoTextLight className="w-48"/> : <LogoTextDark className="mb-1 w-48"/>)}
                </span>
                <p className="px-1 font-black text-[14px]">PH®</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex justify-center items-center gap-2 text-nowrap">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all group"
              >
                {item.label}
                <span className="absolute bottom-1 left-1/2 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-1/3 group-hover:left-1/3" />
              </Link>
            ))}
          </div>

          {/* Utilities & Profile */}
          <div className="flex-1 flex justify-end items-center gap-6">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative flex h-5 w-10 cursor-pointer items-center rounded-full border border-muted-foreground/30 bg-muted/20 p-1 transition-all"
            >
              <div className={`flex h-3 w-3 items-center justify-center rounded-full bg-background shadow-sm transition-all duration-300 ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}>
                {mounted && (theme === "dark" ? <Moon size={8} className="text-primary fill-primary" /> : <Sun size={8} className="text-primary" />)}
              </div>
            </button>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              {user ? (
                <Link href={dashboardPath} className="group flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.1em] italic",
                      role === "admin" ? "text-red-500" : "text-primary"
                    )}>
                      {subLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {label}
                    </span>
                  </div>
                  <div className={cn(
                    "h-9 w-9 border flex items-center justify-center transition-all",
                    role === "admin" ? "border-red-500 bg-red-500/5 group-hover:bg-red-500" : "border-foreground group-hover:bg-primary group-hover:border-primary"
                  )}>
                    {role === "admin" ? (
                      <ShieldAlert size={14} className="text-red-500 group-hover:text-white transition-colors" />
                    ) : (
                      <LayoutDashboard size={14} className="group-hover:text-background transition-colors" />
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button variant="outline" className="h-9 px-6 rounded-none border-2 border-foreground bg-transparent text-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all group flex items-center gap-2">
                      Join
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}