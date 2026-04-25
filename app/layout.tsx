import type { Metadata } from 'next'
import '@/app/globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider' // Adjust path if needed

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dishpatch',
  description: 'Chef booking platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning is essential for next-themes
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${montserrat.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}