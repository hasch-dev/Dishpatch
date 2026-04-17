import type { Metadata } from 'next'
import '@/app/globals.css'

import {Inter, Montserrat} from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dishpatch',
  description: 'Chef booking platform',
  icons: {
    
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${montserrat.className}`}>
        {children}
      </body>
    </html>
  )
}