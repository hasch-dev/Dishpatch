"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import Logo from "./logo-dispatch";
import LogoTextDark from './logo-text-dark';
import LogoTextLight from './logo-text-light';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simplified navigation based on the Landing Page sections
  const navigationItems = [
    { label: "Our Story", href: "#about" },
    { label: "Gallery", href: "#testimonials" },
    { label: "Process", href: "#how-it-works" },
    { label: "Gift a Meal", href: "#gift" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md transition-all duration-300">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="hidden md:grid grid-cols-12 h-16 items-center">
          
          {/* Column 1: Logo - UNTOUCHED */}
          <div className="col-span-3 flex items-center">
            <Link href="/" className="flex items-center h-8 gap-3 group transition-opacity hover:opacity-80">
              <Logo width={40} height={40} />
              <div className="flex flex-row items-center justify-center">
                <span className="text-md gap-2 font-bold uppercase flex items-center justify-center tracking-tighter text-foreground italic">
                  {mounted && (
                    theme === "dark" ? (
                      <LogoTextLight /> 
                    ) : (
                        <LogoTextDark className="mb-2"/>
                    )
                  )}
                </span>
                <p className="px-1 font-black text-[14px]">PH®</p>
              </div>
            </Link>
          </div>

          {/* Column 2: Simplified Navigation Links */}
          <div className="col-span-6 flex justify-center items-center gap-2">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all group"
              >
                {item.label}
                <span className="absolute bottom-1 left-1/2 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-1/3 group-hover:left-1/3" />
              </a>
            ))}
          </div>

          {/* Column 3: Actions */}
          <div className="col-span-3 flex justify-end items-center gap-8">
            
            {/* Theme Toggle - UNTOUCHED */}
            <div className="flex items-center">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative flex h-6 w-11 cursor-pointer items-center rounded-full border border-muted-foreground/30 bg-muted/20 p-1 transition-all hover:border-primary/50"
                aria-label="Toggle Theme"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm transition-all duration-300 ease-in-out ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {mounted &&
                    (theme === "dark" ? (
                      <Moon size={10} className="text-primary fill-primary" />
                    ) : (
                      <Sun size={10} className="text-primary" />
                    ))}
                </div>
              </button>
            </div>

            {/* Redesigned Auth Buttons: Simplified Text */}
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/book">
                <Button className="h-8 px-5 rounded-none bg-foreground text-background font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all border border-foreground hover:border-primary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="text-sm font-black uppercase tracking-tighter italic">
              Dishpatch
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground"
            >
              {mounted &&
                (theme === "dark" ? <Moon size={18} /> : <Sun size={18} />)}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}