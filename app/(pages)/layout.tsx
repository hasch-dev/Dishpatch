import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@/app/globals.css'
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div lang="en">
      <div className="font-sans antialiased">
            <div className="p-4 top-0 left-0 right-0 z-10 bg-transparent w-auto">

                <div className="flex-1">
                    {children}
                </div>
            </div>
            <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </div>
    </div>
  )
}
