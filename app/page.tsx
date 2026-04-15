'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowRight, ChefHat, Clock, MapPin, Users } from 'lucide-react'
import { ChefHatIcon } from '@phosphor-icons/react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ]

  const features = [
    {
      icon: ChefHat,
      title: 'Expert Chefs',
      description: 'Connect with skilled professional chefs ready to create your perfect meal.',
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Simple booking process. Get your private chef experience in minutes.',
    },
    {
      icon: MapPin,
      title: 'Anywhere',
      description: 'Enjoy chef-prepared meals at your home, office, or event venue.',
    },
    {
      icon: Users,
      title: 'Personal Touch',
      description: 'Direct communication with chefs to customize your culinary experience.',
    },
  ]

  return (
    <div className="min-h-screen bg-background w-full relative">
      <Navbar />
      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 md:py-12">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left Column - Text */}
            <div className="flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                  Chef-Prepared Meals at Your{' '}
                  <span className="bg-primary bg-clip-text text-transparent">
                    Fingertips
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground text-balance max-w-md">
                  Book professional chefs for intimate dinners, events, or everyday meals. Connect directly, customize menus, and enjoy restaurant-quality food at home.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Find a Chef <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/auth/sign-up?type=chef">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Become a Chef
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>✓ Browse verified professional chefs</p>
                <p>✓ Direct communication and custom menus</p>
                <p>✓ Flexible scheduling for any event</p>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full aspect-square rounded-2xl bg-primary/20 overflow-hidden border border-primary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ChefHat size={120} className="mx-auto text-primary opacity-50 mb-4" />
                    <p className="text-muted-foreground font-medium">Premium Chef Experiences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-secondary/30 py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Dishpatch?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We simplify the process of connecting with world-class culinary professionals for unforgettable dining experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors"
                  >
                    <div className="mb-4">
                      <Icon className="size-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-42">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple steps to book your perfect chef experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Post Your Event',
                  description: 'Tell us about your event, preferences, dietary requirements, and budget.',
                },
                {
                  step: '02',
                  title: 'Browse Proposals',
                  description: 'Receive personalized proposals from professional chefs with their menus and prices.',
                },
                {
                  step: '03',
                  title: 'Book & Enjoy',
                  description: 'Lock in your chef, finalize details, and enjoy an amazing culinary experience.',
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-primary text-6xl font-bold opacity-20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/4 right-0 transform translate-x-1/2">
                      <ArrowRight className="text-primary/30" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="bg-primary/20 border border-primary/20 mx-4 my-20 md:my-32 rounded-2xl py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience Dishpatch?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of food enthusiasts and professional chefs. Book your first experience today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Get Started <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Already Have an Account?
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>

    </div>
  )
}
