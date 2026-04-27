"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";

const Socials = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "TikTok", href: "#" },
  { name: "Threads", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-24 pb-12 border-t border-primary/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold uppercase tracking-tighter">
                Dishpatch
              </span>
            </div>
            <p className="max-w-xs text-xs font-light leading-relaxed opacity-60 uppercase tracking-widest">
              Standardizing the private culinary experience through professional
              logistics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Connect
              </span>
              <ul className="space-y-2 text-[10px] uppercase tracking-widest opacity-60">
                {Socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      className="hover:text-primary transition-colors"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Inquiries
              </span>
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                office@dishpatch.dev
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 pt-10 border-t border-white/5">
          <p>© {new Date().getFullYear()} Dishpatch Studio</p>
          <div className="flex gap-6">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
