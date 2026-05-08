"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, User, LayoutDashboard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; 
import Logo from "./logo-dispatch";
import LogoTextDark from './logo-text-dark';
import LogoTextLight from './logo-text-light';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null); // Track the specific role
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    const loadIdentity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        setRole(data?.user_type || null);
      }
    };
    loadIdentity();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        setRole(data?.user_type || null);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Determine the correct dashboard path
  const dashboardPath = role === "chef" ? "/chef-dashboard" : "/user-dashboard";

  const navigationItems = [
    { label: "Our Story", href: "/#about" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Process", href: "/#how-it-works" },
    { label: "Gallery", href: "#culinary-gallery" }, // Direct link to your new gallery page
    { label: "Gift an Evening", href: "#gift" },
  ];

  return (
    <header className="font-serif sticky top-0 z-50 flex items-center justify-between h-16 border-b border-border/40 bg-background/95 backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto w-full px-2 lg:px-4">
        <div className="flex w-full h-16 gap-4 items-center">
          
          <div className="w-full flex items-center">
            <Link href="/" className="flex items-center h-8 group transition-opacity hover:opacity-80">
              <Logo width={32} height={32} />
              <div className="flex flex-row items-center justify-center">
                <span className="w-32 text-sm gap-2 font-bold uppercase flex items-center justify-center tracking-tighter text-foreground italic">
                  {mounted && (theme === "dark" ? <LogoTextLight className="w-48"/> : <LogoTextDark className="mb-1 w-48"/>)}
                </span>
                <p className="px-1 font-black text-[14px]">PH®</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-row justify-between items-center gap-2 text-nowrap w-full ">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-all group"
              >
                {item.label}
                <span className="absolute bottom-1 left-1/2 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-1/3 group-hover:left-1/3" />
              </Link>
            ))}
          </div>

          <div className="w-full flex justify-end items-center gap-6">
            <div className="flex items-center">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative flex h-6 w-11 cursor-pointer items-center rounded-full border border-muted-foreground/30 bg-muted/20 p-1 transition-all hover:border-primary/50"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm transition-all duration-300 ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}>
                  {mounted && (theme === "dark" ? <Moon size={10} className="text-primary fill-primary" /> : <Sun size={10} className="text-primary" />)}
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              {user ? (
                <Link href={dashboardPath} className="group flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-primary italic">
                      {role === "chef" ? "Artisan" : "Client"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {role === "chef" ? "Dashboard" : "Dashboard"}
                    </span>
                  </div>
                  <div className="h-9 w-9 border border-foreground flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <LayoutDashboard size={14} className="group-hover:text-background transition-colors" />
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button variant="outline" className="h-9 px-6 rounded-none border-2 border-foreground bg-transparent text-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all group flex items-center gap-2">
                      Sign Up
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header (Updated for role-aware dashboard link) */}
        <div className="flex md:hidden h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="text-sm font-black uppercase tracking-tighter italic text-primary">Dishpatch</span>
          </Link>
          <div className="flex items-center gap-4">
            {user && <Link href={dashboardPath}><User size={18} /></Link>}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}