"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChefHat } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "The Experience", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Gift an Evening", href: "#gift" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="hidden md:grid grid-cols-3 h-20 items-center">
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <ChefHat className="h-6 w-6 stroke-[1.5px]" />
              </div>
              <span className="text-2xl font-serif tracking-tight text-foreground">
                Dishpatch
              </span>
            </Link>
          </div>

          <div className="flex justify-center items-center gap-1">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex justify-end items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="h-10 px-6 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-widest transition-all border-none">
                Join the Table
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex md:hidden h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-serif">Dishpatch</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-primary"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10 py-6 space-y-6 bg-background animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
