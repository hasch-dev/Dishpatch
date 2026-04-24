'use client'

import Link from 'next/link'
import { ChefHat, ArrowRight } from 'lucide-react'

// Define the SVG paths for brands since Lucide deprecated them
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
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Bio */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-orange-200">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 uppercase">
                Dishpatch
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed max-w-sm text-sm">
              Connecting food enthusiasts with world-class culinary professionals. 
              Experience unforgettable, customized dining in the comfort of your own space.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  aria-label={item.name}
                  className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all"
                >
                  <item.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-500 hover:text-orange-600 transition-all text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-500 hover:text-orange-600 transition-all text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Stay Updated</h4>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full h-11 px-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-slate-900 hover:bg-orange-600 text-white transition-colors flex items-center justify-center">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By subscribing, you agree to our Privacy Policy and provide consent to receive updates.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium tracking-tight">
            &copy; {new Date().getFullYear()} Dishpatch Culinary Inc.
          </p>
          <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="#" className="hover:text-orange-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-orange-600 transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}