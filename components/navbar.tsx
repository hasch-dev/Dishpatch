'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChefHat } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { label: 'The Experience', href: '#experience' },
    { label: 'Our Process', href: '#process' },
    { label: 'Gift an Evening', href: '#gift' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Desktop: 3-Column Grid for Perfect Centering */}
        <div className="hidden md:grid grid-cols-3 h-20 items-center">
          
          {/* Column 1: Logo (Left Aligned) */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                <ChefHat className="h-6 w-6 stroke-[1.5px]" />
              </div>
              <span className="text-2xl font-serif tracking-tight text-foreground">
                Dishpatch
              </span>
            </Link>
          </div>

          {/* Column 2: Navigation (Dead Center) */}
          <div className="flex justify-center items-center gap-2">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Column 3: Actions (Right Aligned) */}
          <div className="flex justify-end items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 border-none">
                Join the Table
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Header (Standard Justify) */}
        <div className="flex md:hidden h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <ChefHat className="h-6 w-6 text-primary" />
             <span className="text-xl font-serif text-foreground">Dishpatch</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-primary hover:bg-primary/10 rounded-xl"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/10 py-6 space-y-6 bg-background">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 rounded-xl transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-primary/5">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up" className="w-full">
                <Button className="w-full h-12 rounded-xl text-primary">Join the Table</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}