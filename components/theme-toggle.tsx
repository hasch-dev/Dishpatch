"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-14 h-7" />;

  const isDark = theme === "dark";

  return (
    <div
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-7 bg-muted border border-border cursor-pointer flex items-center px-1 group transition-colors duration-300"
    >
      {/* The Track Icons */}
      <div className="absolute inset-0 flex justify-between items-center px-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
        <Sun className="h-3 w-3 text-foreground" />
        <Moon className="h-3 w-3 text-foreground" />
      </div>

      {/* The Sliding Handle */}
      <motion.div
        className="z-10 h-5 w-5 bg-primary shadow-sm"
        animate={{ x: isDark ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
