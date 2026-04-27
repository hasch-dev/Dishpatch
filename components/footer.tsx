"use client";

import Link from "next/link";

const Navigation = [
  { name: "The Residency", href: "/residency" },
  { name: "Artisan Collective", href: "/collective" },
  { name: "Culinary Consultancy", href: "/consultancy" },
  { name: "Gastronomy Commissary", href: "/commissary" },
];

export default function Footer() {
  return (
    <footer className="bg-background text-foreground pt-32 pb-16 border-t border-border relative overflow-hidden transition-colors duration-300">
      {/* Structural Corner Detail - Direct match to CTA section */}
      <div className="absolute top-0 left-0 w-32 h-px bg-primary/20" />
      <div className="absolute top-0 left-0 w-px h-32 bg-primary/20" />

      <div className="container mx-auto px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
          {/* Column 1: Brand & Manifesto */}
          <div className="md:col-span-5 space-y-10">
            <div className="flex items-center gap-4">
              {/* Minimalist Geometric Logo Replacement */}
              <div className="w-10 h-10 border border-primary/40 flex items-center justify-center group hover:bg-primary transition-all duration-300">
                <div className="w-4 h-4 border-2 border-primary group-hover:border-primary-foreground rotate-45" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter italic">
                Dishpatch
                <span className="text-primary text-[10px] align-top ml-1">
                  ®
                </span>
              </span>
            </div>

            <p className="max-w-sm text-xs font-light leading-relaxed opacity-60 uppercase tracking-[0.2em]">
              A modern culinary system deploying elite artisans and bespoke
              gastronomy to the world's most discerning venues.
              <br />
              <br />
              Savor the moment, defined by taste.
            </p>

            {/* Text-Based Socials for Zero-Error Loading */}
            <div className="flex gap-8">
              {["IG", "FB", "X", "LI"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-[10px] font-bold tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-primary transition-all"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: System Navigation */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary/70">
              System
            </h4>
            <ul className="space-y-5">
              {Navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[10px] font-medium uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-all flex items-center gap-3 group"
                  >
                    <span className="h-px w-0 bg-primary group-hover:w-4 transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Presence */}
          <div className="md:col-span-4 space-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary/70">
                Direct Inquiries
              </h4>
              <a
                href="mailto:concierge@dishpatch.system"
                className="block text-sm font-black tracking-tighter uppercase italic hover:text-primary transition-colors border-b border-border pb-3"
              >
                concierge@dishpatch.system
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary/70">
                Presence
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {["New York", "London", "Dubai", "Manila"].map((loc) => (
                  <div
                    key={loc}
                    className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {loc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-32 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <p className="italic">
              © {new Date().getFullYear()} Dishpatch Studio
            </p>
            <span className="hidden md:block h-px w-8 bg-border" />
            <p>Deployment v1.0.4</p>
          </div>

          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-all">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-all">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary transition-all">
              Cookie Ledger
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
