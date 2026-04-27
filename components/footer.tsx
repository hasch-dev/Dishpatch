"use client";

import Link from "next/link";
import { ChefHat, ArrowRight } from "lucide-react";

const SocialIcons = {
  Facebook: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Instagram: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  TikTok: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  Threads: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.25 20.25h-14.5c-1.105 0-2-.895-2-2V5.75c0-1.105.895-2 2-2h14.5c1.105 0 2 .895 2 2v12.5c0 1.105-.895 2-2 2z" />
      <path d="M9 15.75c0-1.5 1.5-3 3-3s3 1.5 3 3" />
    </svg>
  ),
};

export default function Footer() {
  const socials = [
    { name: "Facebook", Icon: SocialIcons.Facebook },
    { name: "Instagram", Icon: SocialIcons.Instagram },
    { name: "TikTok", Icon: SocialIcons.TikTok },
    { name: "Threads", Icon: SocialIcons.Threads },
  ];

  return (
    <footer className="bg-background border-t border-primary/10 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="font-serif text-3xl tracking-tight">
                Dishpatch
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-light max-w-sm leading-relaxed italic">
              Crafting private culinary residencies. The best seat in the world
              is at your own dining table.
            </p>
            <div className="flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  className="h-10 w-10 border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
                >
                  <s.Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-[10px] font-bold uppercase tracking-[0.3em]">
            <h4 className="text-primary">— Explore</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>
                <Link href="#experience" className="hover:text-foreground">
                  Experience
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-foreground">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/chef-apply" className="hover:text-foreground">
                  Artisan Apply
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              — Concierge
            </h4>
            <div className="flex border-b border-primary/20 pb-2">
              <input
                type="email"
                placeholder="JOIN THE LIST"
                className="bg-transparent border-none text-[10px] tracking-widest outline-none w-full font-bold"
              />
              <button>
                <ArrowRight className="h-4 w-4 text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold">
            &copy; {new Date().getFullYear()} Dishpatch. Studio Edition.
          </p>
          <div className="flex gap-8 text-[9px] uppercase tracking-[0.2em] font-bold">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
