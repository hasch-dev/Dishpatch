"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ChatTeardropText } from "@phosphor-icons/react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiThreads, 
  SiTiktok 
} from "@icons-pack/react-simple-icons";

// Branding components
import Logo from "./logo-dispatch";
import LogoTextLight from "./logo-text-light";
import LogoTextDark from "./logo-text-dark";

const Navigation = [
  { name: "The Residency", href: "/residency" },
  { name: "Artisan Collective", href: "/collective" },
  { name: "Culinary Consultancy", href: "/consultancy" },
  { name: "Gastronomy Commissary", href: "/commissary" },
];

const Socials = [
  { 
    name: "Facebook", 
    Icon: SiFacebook, 
    href: "https://facebook.com/dishpatch" 
  },
  { 
    name: "Instagram", 
    Icon: SiInstagram, 
    href: "https://instagram.com/dishpatch" 
  },
  { 
    name: "Threads", 
    Icon: SiThreads, 
    href: "https://threads.net/dishpatch" 
  },
  { 
    name: "TikTok", 
    Icon: SiTiktok, 
    href: "https://tiktok.com/@dishpatch" 
  },
];

const Resources = [
  { name: "Help Center", href: "/help" },
  { name: "Artisan Onboarding", href: "/join" },
  { name: "Safety Protocol", href: "/safety" },
  { name: "Careers", href: "/careers" },
];

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Handle mounting to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background text-foreground pt-32 pb-16 border-t border-border relative overflow-hidden transition-colors duration-300">
      {/* Structural Brutalist Details */}
      <div className="absolute top-0 left-0 w-32 h-px bg-primary/20" />
      <div className="absolute top-0 left-0 w-px h-32 bg-primary/20" />

      <div className="container mx-auto px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Column 1: Brand & Manifesto */}
          <div className="md:col-span-4 space-y-10">
            <div className="flex items-center">
              <Link href="/" className="flex items-center h-8 gap-3 group transition-opacity hover:opacity-80">
                <Logo width={40} height={40} />
                <div className="flex flex-row items-center justify-center">
                  <div className="flex items-center justify-center tracking-tighter text-foreground italic min-w-[120px]">
                    {mounted ? (
                      theme === "dark" ? (
                        <LogoTextLight className="mt-1" />
                      ) : (
                        <LogoTextDark className="mb-1" />
                      )
                    ) : (
                      <div className="h-4 w-24 bg-transparent" /> // SSR Placeholder
                    )}
                  </div>
                  <p className="px-1 text-[12px] font-black">PH®</p>
                </div>
              </Link>
            </div>

            <p className="max-w-sm text-xs font-light leading-relaxed opacity-80 uppercase tracking-[0.2em]">
              A modern culinary system deploying elite artisans and bespoke
              gastronomy to the world's most discerning venues.
              <br /><br />
              Savor the moment, defined by taste.
            </p>

            {/* Social Media Links using Si Icons */}
            <div className="flex gap-6">
              {Socials.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-40 hover:opacity-100 hover:text-primary transition-all duration-300 transform hover:-translate-y-1"
                >
                  <platform.Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: System Navigation */}
          <div className="md:col-span-2 space-y-8">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.6em] text-primary">
              System
            </h4>
            <ul className="space-y-5">
              {Navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[12px] font-medium uppercase tracking-widest opacity-80 hover:opacity-100 hover:text-primary transition-all flex items-center gap-3 group"
                  >
                    <span className="h-px w-0 bg-primary group-hover:w-4 transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="md:col-span-2 space-y-8">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.6em] text-primary">
              Support
            </h4>
            <ul className="space-y-5">
              {Resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[12px] font-medium uppercase tracking-widest opacity-80 hover:opacity-100 hover:text-primary transition-all flex items-center gap-3 group"
                  >
                    <span className="h-px w-0 bg-primary group-hover:w-4 transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Direct Inquiries */}
          <div className="md:col-span-4 space-y-12">
            <div className="space-y-6">
              <h4 className="text-[12px] font-bold uppercase tracking-[0.6em] text-primary">
                Direct Inquiries
              </h4>
              <Link 
                href="/messages" 
                className="group flex items-center justify-between border-b border-border pb-4 hover:border-primary transition-colors"
              >
                <span className="text-sm font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                  Concierge Live Chat
                </span>
                <ChatTeardropText 
                  size={18} 
                  weight="thin" 
                  className="opacity-40 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all" 
                />
              </Link>
              <p className="text-[12px] uppercase tracking-widest opacity-40 italic">
                Average response time: &lt; 15 minutes
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[12px] font-bold uppercase tracking-[0.6em] text-primary">
                Presence
              </h4>
              <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[12px] font-bold uppercase tracking-widest">
                  Philippines
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-32 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 text-[12px] font-bold uppercase tracking-[0.4em] opacity-30">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <p className="italic">
              © {new Date().getFullYear()} Dishpatch Studio
            </p>
            <span className="hidden md:block h-px w-8 bg-border" />
            <p>Deployment v1.1.0</p>
          </div>

          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-primary transition-all">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-all">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-all">
              Cookie Ledger
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}