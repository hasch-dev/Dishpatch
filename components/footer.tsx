'use client'

import Link from 'next/link'
import { ChefHat, ArrowRight } from 'lucide-react'

const BrandIcons = {
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  ),
  TikTok: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
  )
}

export default function Footer() {
  const socialLinks = [
    { name: 'Facebook', Icon: BrandIcons.Facebook, href: '#' },
    { name: 'Instagram', Icon: BrandIcons.Instagram, href: '#' },
    { name: 'TikTok', Icon: BrandIcons.TikTok, href: '#' },
  ]

  const platformLinks = [
    { label: 'Find a Chef', href: '#' },
    { label: 'Become a Chef', href: '#' },
    { label: 'How it Works', href: '#' },
    { label: 'Pricing', href: '#' },
  ]

  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ]

  return (
    <footer className="bg-background border-t border-primary/10 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
          
          {/* Brand & Bio */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-lg shadow-primary/20">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-2xl tracking-tight text-foreground">
                Dishpatch
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm text-sm font-light">
              Elevating private dining into an art form. We connect discerning hosts with world-class chefs for bespoke culinary residencies.
            </p>
            
            <div className="flex items-center gap-4">
              {socialLinks.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-300"
                >
                  <item.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-foreground uppercase tracking-[0.2em] text-[10px]">The Platform</h4>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-foreground uppercase tracking-[0.2em] text-[10px]">The Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge */}
          <div className="space-y-6">
            <h4 className="font-bold text-foreground uppercase tracking-[0.2em] text-[10px]">Concierge Updates</h4>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full h-12 px-5 rounded-2xl border border-primary/20 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-light">
              By joining, you agree to our refined privacy standards.
            </p>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide uppercase">
            &copy; {new Date().getFullYear()} Dishpatch Culinary.
          </p>
          <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}