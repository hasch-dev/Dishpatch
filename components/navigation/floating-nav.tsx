"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Image as ImageIcon, PackageOpen, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function FloatingNav() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed top-8 left-4 md:left-8 z-[100] flex flex-col items-center gap-3 p-3 bg-background/80 backdrop-blur-xl border-2 border-foreground/10 rounded-full shadow-2xl"
    >
      <Link href="/">
        <Button variant="ghost" size="icon" className={cn(
          "rounded-full h-10 w-10 transition-colors",
          pathname === "/" ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
        )}>
          <Home className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/gallery">
        <Button variant="ghost" size="icon" className={cn(
          "rounded-full h-10 w-10 transition-colors",
          pathname === "/gallery" ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
        )}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/products">
        <Button variant="ghost" size="icon" className={cn(
          "rounded-full h-10 w-10 transition-colors",
          pathname === "/products" ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
        )}>
          <PackageOpen className="h-4 w-4" />
        </Button>
      </Link>

      <div className="w-6 h-px bg-foreground/20 my-1" />
      
      {mounted && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 hover:bg-amber-500 hover:text-white transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      )}
    </motion.div>
  );
}