"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChefHat } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "The System", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Partner Apply", href: "/chef-apply" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-secondary/5 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="hidden md:grid grid-cols-3 h-16 items-center">
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold uppercase tracking-tighter">
                Dishpatch
              </span>
            </Link>
          </div>

          <div className="flex justify-center gap-6">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="h-9 px-6 rounded-none bg-secondary text-secondary-foreground font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-colors">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
